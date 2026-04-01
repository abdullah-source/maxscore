"""
LLM client for generating personalized suggestions.
Uses Claude API with psychologically optimized prompts.
"""

import anthropic
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging
import json

from app.config import settings
from app.services.scorer import OverallScore, FeatureScore

logger = logging.getLogger(__name__)


@dataclass
class Suggestion:
    """Generated suggestion for a facial feature."""
    feature: str
    title: str
    description: str
    tips: List[str]
    priority: str  # 'high', 'medium', 'low'
    impact: str
    products: Optional[List[Dict]] = None


@dataclass
class ChatResponse:
    """Response from chat API."""
    content: str
    tokens_used: int
    suggestions: List[str]


class LLMClient:
    """
    Claude-powered LLM client for generating suggestions and chat responses.
    Uses psychologically optimized prompts for positive, actionable advice.
    """

    SYSTEM_PROMPT = """You are MaxScore AI, a friendly and knowledgeable beauty and self-improvement advisor.
Your role is to provide personalized, actionable advice based on facial analysis results.

COMMUNICATION STYLE:
- Be encouraging and positive - focus on potential, not flaws
- Use empowering language: "enhance", "optimize", "maximize" instead of "fix", "correct"
- Be specific and actionable - give concrete steps
- Acknowledge what's already working well before suggesting improvements
- Frame improvements as opportunities, not necessities
- Use inclusive language that works for all genders
- Back up advice with brief explanations of why it works

PSYCHOLOGICAL PRINCIPLES:
- Start responses with validation of strengths
- Frame suggestions as "quick wins" when possible
- Use social proof ("many people find that...")
- Provide options rather than demands
- End on an encouraging, forward-looking note

AVOID:
- Negative language about appearance
- Unrealistic promises or timelines
- Pushing expensive procedures as first options
- Body shaming or comparison to others
- Medical advice - suggest consulting professionals for medical concerns"""

    def __init__(self):
        """Initialize Anthropic client."""
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"
        logger.info("LLMClient initialized with Claude")

    async def generate_suggestions(
        self,
        scores: OverallScore,
        context: Optional[Dict] = None,
    ) -> List[Suggestion]:
        """
        Generate personalized suggestions based on facial analysis scores.

        Args:
            scores: OverallScore from facial analysis
            context: Additional context (user preferences, history, etc.)

        Returns:
            List of Suggestion objects
        """
        # Build prompt with score context
        prompt = self._build_suggestion_prompt(scores, context)

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=self.SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            # Parse response into suggestions
            content = response.content[0].text
            suggestions = self._parse_suggestions(content, scores)

            return suggestions

        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return self._get_fallback_suggestions(scores)

    async def chat(
        self,
        message: str,
        scores: OverallScore,
        history: List[Dict],
    ) -> ChatResponse:
        """
        Handle chat conversation about facial analysis.

        Args:
            message: User's message
            scores: OverallScore for context
            history: Previous messages in conversation

        Returns:
            ChatResponse with AI reply
        """
        # Build messages with context
        context_message = self._build_chat_context(scores)
        messages = [
            {"role": "user", "content": context_message},
            {"role": "assistant", "content": "I've reviewed your facial analysis results. How can I help you today?"},
            *history,
            {"role": "user", "content": message},
        ]

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                system=self.SYSTEM_PROMPT,
                messages=messages,
            )

            content = response.content[0].text
            tokens = response.usage.input_tokens + response.usage.output_tokens

            # Extract any follow-up suggestions
            suggestions = self._extract_suggestions(content)

            return ChatResponse(
                content=content,
                tokens_used=tokens,
                suggestions=suggestions,
            )

        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return ChatResponse(
                content="I apologize, but I'm having trouble processing your request. Please try again.",
                tokens_used=0,
                suggestions=[],
            )

    def _build_suggestion_prompt(
        self,
        scores: OverallScore,
        context: Optional[Dict],
    ) -> str:
        """Build prompt for suggestion generation."""
        features_text = "\n".join([
            f"- {f.name}: {f.score}/10 ({f.percentile}th percentile) - {f.description}"
            for f in scores.features.values()
        ])

        return f"""Based on this facial analysis, generate 3 personalized improvement suggestions:

ANALYSIS RESULTS:
Overall Score: {scores.overall}/10 (Top {100 - scores.percentile}%)

Feature Breakdown:
{features_text}

Strengths: {', '.join(scores.strengths) or 'None identified'}
Areas to Improve: {', '.join(scores.areas_to_improve) or 'None identified'}

Generate exactly 3 suggestions in this JSON format:
{{
  "suggestions": [
    {{
      "feature": "feature name",
      "title": "short actionable title",
      "description": "2-3 sentence explanation using positive framing",
      "tips": ["specific tip 1", "specific tip 2", "specific tip 3"],
      "priority": "high|medium|low",
      "impact": "expected improvement description"
    }}
  ]
}}

Prioritize high-impact, achievable improvements. Start with strengths acknowledgment."""

    def _build_chat_context(self, scores: OverallScore) -> str:
        """Build context message for chat."""
        return f"""I just received my facial analysis results:
- Overall Score: {scores.overall}/10
- Best Features: {', '.join(scores.strengths) or 'Not specified'}
- Areas to Work On: {', '.join(scores.areas_to_improve) or 'Not specified'}

Feature scores:
{chr(10).join([f'- {f.name}: {f.score}/10' for f in scores.features.values()])}"""

    def _parse_suggestions(
        self,
        content: str,
        scores: OverallScore,
    ) -> List[Suggestion]:
        """Parse LLM response into Suggestion objects."""
        try:
            # Find JSON in response
            start = content.find('{')
            end = content.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = content[start:end]
                data = json.loads(json_str)

                return [
                    Suggestion(
                        feature=s['feature'],
                        title=s['title'],
                        description=s['description'],
                        tips=s['tips'],
                        priority=s['priority'],
                        impact=s['impact'],
                    )
                    for s in data.get('suggestions', [])
                ]
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Failed to parse suggestions: {e}")

        return self._get_fallback_suggestions(scores)

    def _get_fallback_suggestions(self, scores: OverallScore) -> List[Suggestion]:
        """Generate fallback suggestions when LLM fails."""
        suggestions = []

        # Find lowest scoring feature
        sorted_features = sorted(
            scores.features.items(),
            key=lambda x: x[1].score
        )

        for key, feature in sorted_features[:3]:
            suggestions.append(
                Suggestion(
                    feature=feature.name,
                    title=f"Enhance Your {feature.name}",
                    description=f"Your {feature.name.lower()} has potential for improvement. Small changes can make a big difference.",
                    tips=[
                        "Focus on consistent daily habits",
                        "Consider consulting a professional",
                        "Track your progress over time",
                    ],
                    priority="medium",
                    impact="Visible improvement with consistent effort",
                )
            )

        return suggestions

    def _extract_suggestions(self, content: str) -> List[str]:
        """Extract action suggestions from chat response."""
        suggestions = []
        lines = content.split('\n')

        for line in lines:
            # Look for bullet points or numbered items
            if line.strip().startswith(('-', '•', '1.', '2.', '3.')):
                clean = line.strip().lstrip('-•0123456789. ')
                if len(clean) > 10:  # Filter out very short items
                    suggestions.append(clean)

        return suggestions[:5]  # Return top 5


# Singleton instance
_llm_client: Optional[LLMClient] = None


def get_llm_client() -> LLMClient:
    """Get or create singleton LLMClient instance."""
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client
