"""
BOOTCAMP REFERENCE — Do not import into TalentLens production code.

KEY PATTERN: LLM-based reranking of vector search results using JSON mode.

How it works:
  1. Truncate each result's context to 500 chars (token budget control)
  2. Send all results + the query to GPT-4o in JSON mode
  3. Ask for a ranked list of result IDs
  4. Map the ranked IDs back to original results with scores
  5. Gracefully fall back to original order if the LLM call fails

TalentLens adaptation notes:
  - TalentLens V1 uses deterministic skill overlap as the reranker instead.
    This file is reference for the ROADMAP item: LLM qualitative match assessment.
  - If you use this pattern, rewrite in TypeScript
  - Note: the docstring says "GPT-3.5 Turbo" but the code uses "gpt-4o" — the code is correct
  - Consider using gpt-4o-mini for cost savings at scale
"""

import json


def rerank_results_gpt(query: str, results: list, top_n: int = None) -> list:
    """
    Reranks search results using GPT-4o for improved relevance.

    Args:
        query: The user's search query
        results: List of result dictionaries with 'context' field
        top_n: Number of top results to return (default: return all, sorted)

    Returns:
        Reranked list of results sorted by relevance score
    """
    if not results or not openai_client:
        return results

    # If we have few results, just return them as-is
    if len(results) <= 3:
        for i, result in enumerate(results):
            result['rerank_score'] = len(results) - i
        return results

    # Build a prompt asking GPT to rank the results by relevance
    contexts_with_ids = []
    for idx, item in enumerate(results):
        contexts_with_ids.append({
            "id": idx,
            "context": item.get('context', '')[:500]  # Limit to first 500 chars to save tokens
        })

    rerank_prompt = f"""Given the user query and the following search results, rank them by relevance to the query.
Return ONLY a JSON array of result IDs in order from most relevant to least relevant.

User Query: {query}

Search Results:
{json.dumps(contexts_with_ids, indent=2)}

Return format: {{"ranked_ids": [2, 0, 1, ...]}}"""

    try:
        rerank_response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a relevance ranking expert. Analyze search results and rank them by relevance to the user's query."},
                {"role": "user", "content": rerank_prompt}
            ],
            max_tokens=200,
            temperature=0,
            response_format={"type": "json_object"}
        )

        ranking_data = json.loads(rerank_response.choices[0].message.content)
        ranked_ids = ranking_data.get('ranked_ids', [])

        # Create a mapping of original index to rank score
        rank_scores = {}
        for rank, idx in enumerate(ranked_ids):
            rank_scores[idx] = len(ranked_ids) - rank  # Higher score = more relevant

        # Attach rerank scores to results
        for i, result in enumerate(results):
            result['rerank_score'] = rank_scores.get(i, 0)

        # Sort by rerank score (descending)
        reranked_results = sorted(results, key=lambda x: x['rerank_score'], reverse=True)

        # Return top_n if specified, otherwise return all
        if top_n:
            return reranked_results[:top_n]

        return reranked_results

    except Exception as e:
        print(f"Error during reranking: {str(e)}, returning original order")
        # Fallback: return original results with default scores
        for i, result in enumerate(results):
            result['rerank_score'] = len(results) - i
        return results
