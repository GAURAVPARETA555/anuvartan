# backend/triage/services/ai_tools.py
#
# WHAT IS TOOL CALLING?
# ---------------------
# Normally an LLM replies with free text. Tool calling (also called "function calling")
# lets you tell the model: "Instead of writing free text, you may call one of these
# named functions with structured arguments." The model decides *when* to call the
# function and *what arguments* to pass -- Groq returns the call as structured data
# instead of prose, so we never have to parse or validate text ourselves.
#
# This file defines the tool schema in JSON Schema format that the OpenAI-compatible
# API understands. The schema tells the model:
#   - What the function is named and what it does
#   - What arguments it accepts and their exact types/constraints
#   - Which arguments are required before the tool can be called

TRIAGE_TOOLS = [
    {
        # "type": "function" is the only tool type the OpenAI API currently supports.
        "type": "function",
        "function": {
            "name": "submit_triage_summary",

            # The description is critical -- the model reads this to decide *when* to call
            # the tool. Be explicit: call it only once enough info is gathered.
            "description": (
                "Call this tool to CREATE or UPDATE the structured case triage summary for the care team. "
                "Call it during initial triage when sufficient clinical details (chief complaint, symptoms, "
                "duration, severity) are gathered, OR whenever the patient reports new clinically relevant updates "
                "(e.g. persistent symptoms after finishing medication, new symptoms, worsening severity), "
                "OR immediately if emergency red flags are detected. Calling this tool updates case.ai_summary; "
                "it does NOT terminate or lock the conversation."
            ),

            # The "parameters" block is a standard JSON Schema object that describes
            # the arguments the model must fill in when calling the tool.
            "parameters": {
                "type": "object",
                "properties": {

                    "chief_complaint": {
                        "type": "string",
                        "description": (
                            "The patient's primary reason for seeking care, "
                            "described in plain language (e.g. 'severe headache for 2 days')."
                        ),
                    },

                    "symptoms": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": (
                            "All individual symptoms the patient has reported "
                            "(e.g. ['headache', 'nausea', 'sensitivity to light'])."
                        ),
                    },

                    "duration": {
                        "type": "string",
                        "description": (
                            "How long the patient has had these symptoms "
                            "(e.g. '3 days', 'since yesterday evening', '2 hours'). "
                            "Leave empty string if not mentioned."
                        ),
                    },

                    "severity_assessment": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "critical"],
                        "description": (
                            "Your assessment of overall urgency based on reported symptoms. "
                            "'critical' must be used immediately if any emergency sign is present."
                        ),
                    },

                    "red_flags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": (
                            "List any emergency warning signs the patient mentioned "
                            "(e.g. ['chest pain', 'shortness of breath']). "
                            "Empty list if none."
                        ),
                    },

                    "summary_text": {
                        "type": "string",
                        "description": (
                            "A concise 2-3 sentence clinical summary for the care team, "
                            "written in professional language. Include chief complaint, "
                            "key symptoms, duration, and severity."
                        ),
                    },

                    "new_updates": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": (
                            "List any new clinical updates reported by the patient in subsequent turns "
                            "(e.g. ['Fever persists after completing prescribed Paracetamol', 'Developed new cough']). "
                            "Empty list if initial summary."
                        ),
                    },
                },

                # These fields MUST be present in the tool call -- the model cannot
                # omit them. Optional fields (duration, red_flags) may be empty.
                "required": [
                    "chief_complaint",
                    "symptoms",
                    "severity_assessment",
                    "summary_text",
                ],
            },
        },
    }
]
