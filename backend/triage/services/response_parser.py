import json
import logging
import re
logger = logging.getLogger(__name__)
class ResponseParserError(Exception):
    """
    Raised when the AI response cannot be parsed into valid JSON.
    """
    pass
class ResponseParser:
    @staticmethod
    def parse_json(ai_response: str) -> dict:
        """
        Clean and parse an AI response into a Python dictionary.

        Args:
            ai_response: Raw text returned by the AI model.

        Returns:
            Parsed JSON as a Python dictionary.

        Raises:
            ResponseParserError:
                If the AI response cannot be parsed.
        """

        try:
            # Remove markdown code fences such as ```json ... ```
            cleaned = re.sub(
                r"```(?:json)?|```",
                "",
                ai_response,
                flags=re.IGNORECASE,
            ).strip()

            # Find the first JSON object
            start = cleaned.find("{")
            end = cleaned.rfind("}")

            if start == -1 or end == -1:
                raise ResponseParserError(
                    "No JSON object found in AI response."
                )

            cleaned = cleaned[start:end + 1]

            parsed = json.loads(cleaned)

            return parsed

        except json.JSONDecodeError as e:
            logger.exception("Invalid JSON returned by AI.")
            raise ResponseParserError(
                "Failed to parse AI JSON response."
            ) from e

        except Exception as e:
            logger.exception("Unexpected parser error.")
            raise ResponseParserError(
                "Unexpected parser failure."
            ) from e