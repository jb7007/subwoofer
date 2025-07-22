from flask import jsonify


def verify(fields: dict, error_code, *, msg_override=None, does_exist=False, verb_override=None):
    """
    Validate presence or absence of fields for requests.
    Returns a Flask JSON response tuple if validation fails.
    """
    missing = []
    for key, val in fields.items():
        condition = val if does_exist else not val
        if condition:
            if msg_override:
                return jsonify({"message": msg_override}), error_code
            missing.append(key)
    if missing:
        msg = ", ".join(missing)
        verb = verb_override or ("already exist" if does_exist else "are missing")
        return jsonify({"message": f"The following fields {verb}: {msg}"}), error_code