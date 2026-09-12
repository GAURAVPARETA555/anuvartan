import logging
logger = logging.getLogger(__name__)
class ResponseValidationError(Exception):
    """
    Raised when the AI response does not match
    the expected JSON structure.
    """
    pass
class ResponseValidator:
    """
    Validates the JSON returned by the AI model.
    """

    REQUIRED_KEYS = {
        "disease",
        "medicines",
        "diet",
        "lifestyle",
        "warning_signs",
        "follow_up",
    }

    @staticmethod
    def validate_response(data: dict) -> dict:
        """
        Validate the AI response structure.

        Args:
            data: Parsed JSON dictionary.

        Returns:
            The validated dictionary.

        Raises:
            ResponseValidationError:
                If validation fails.
        """

        # -----------------------------
        # 1. Response must be a dictionary
        # -----------------------------
        if not isinstance(data, dict):
            raise ResponseValidationError(
                "AI response must be a JSON object."
            )

        # -----------------------------
        # 2. Check required keys
        # -----------------------------
        missing_keys = ResponseValidator.REQUIRED_KEYS - data.keys()

        if missing_keys:
            raise ResponseValidationError(
                f"Missing required keys: {', '.join(sorted(missing_keys))}"
            )

        # -----------------------------
        # 3. Validate disease
        # -----------------------------
        disease = data["disease"]

        if not isinstance(disease, dict):
            raise ResponseValidationError(
                "'disease' must be an object."
            )

        for key in ("name", "summary"):
            if key not in disease:
                raise ResponseValidationError(
                    f"'disease.{key}' is missing."
                )

        # -----------------------------
        # 4. Validate medicines
        # -----------------------------
        medicines = data["medicines"]

        if not isinstance(medicines, list):
            raise ResponseValidationError(
                "'medicines' must be a list."
            )

        for medicine in medicines:

            if not isinstance(medicine, dict):
                raise ResponseValidationError(
                    "Each medicine must be an object."
                )

            required_fields = [
                "name",
                "purpose",
                "dosage",
                "timing",
                "food_instruction",
                "duration",
                "side_effects",
                "precautions",
            ]

            for field in required_fields:
                if field not in medicine:
                    raise ResponseValidationError(
                        f"Medicine is missing '{field}'."
                    )

        # -----------------------------
        # 5. Validate diet
        # -----------------------------
        diet = data["diet"]

        if not isinstance(diet, dict):
            raise ResponseValidationError(
                "'diet' must be an object."
            )

        if "recommended" not in diet or "avoid" not in diet:
            raise ResponseValidationError(
                "'diet' must contain 'recommended' and 'avoid'."
            )

        # -----------------------------
        # 6. Validate list fields
        # -----------------------------
        if not isinstance(data["lifestyle"], list):
            raise ResponseValidationError(
                "'lifestyle' must be a list."
            )

        if not isinstance(data["warning_signs"], list):
            raise ResponseValidationError(
                "'warning_signs' must be a list."
            )

        # -----------------------------
        # 7. Validate follow_up
        # -----------------------------
        if not isinstance(data["follow_up"], str):
            raise ResponseValidationError(
                "'follow_up' must be a string."
            )

        logger.info("AI response validated successfully.")

        return data