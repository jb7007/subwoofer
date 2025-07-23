"""
Input validation utilities for practice tracking API.

Provides validation functions for log submission data to prevent
server crashes and return meaningful error responses.
"""

from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional


def validate_required_fields(data: Dict[str, Any], required: List[str]) -> Optional[str]:
    """
    Check if all required fields are present in the data.
    
    Args:
        data: Dictionary containing request data
        required: List of required field names
        
    Returns:
        Error message if validation fails, None if valid
    """
    if not isinstance(data, dict):
        return "Request data must be a JSON object"
    
    missing_fields = [field for field in required if field not in data]
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    
    return None


def validate_timestamp_format(timestamp_value: Any) -> Tuple[Optional[datetime], Optional[str]]:
    """
    Validate and parse timestamp value.
    
    Args:
        timestamp_value: The timestamp value to validate
        
    Returns:
        Tuple of (parsed_datetime, error_message)
        If valid: (datetime_object, None)
        If invalid: (None, error_message)
    """
    if timestamp_value is None:
        return None, "Timestamp cannot be None"
    
    if not isinstance(timestamp_value, str):
        return None, "Timestamp must be a string in ISO format"
    
    try:
        parsed_dt = datetime.fromisoformat(timestamp_value)
        return parsed_dt, None
    except ValueError:
        return None, f"Invalid timestamp format: '{timestamp_value}'. Expected ISO format (e.g., '2025-07-23T10:30:00')"


def validate_duration(duration_value: Any) -> Optional[str]:
    """
    Validate practice duration value.
    
    Args:
        duration_value: The duration value to validate
        
    Returns:
        Error message if validation fails, None if valid
    """
    if duration_value is None:
        return "Duration cannot be None"
    
    # Try to convert to integer
    try:
        duration_int = int(duration_value)
    except (ValueError, TypeError):
        return f"Duration must be a number, got: {type(duration_value).__name__}"
    
    # Check reasonable bounds
    if duration_int <= 0:
        return "Duration must be greater than 0 minutes"
    
    if duration_int > 1440:  # 24 hours in minutes
        return "Duration cannot exceed 1440 minutes (24 hours)"
    
    return None


def validate_instrument(instrument_value: Any) -> Optional[str]:
    """
    Validate instrument value.
    
    Args:
        instrument_value: The instrument value to validate
        
    Returns:
        Error message if validation fails, None if valid
    """
    if instrument_value is None:
        return "Instrument cannot be None"
    
    if not isinstance(instrument_value, str):
        return "Instrument must be a string"
    
    if len(instrument_value.strip()) == 0:
        return "Instrument cannot be empty"
    
    return None


def validate_log_submission_data(data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], Optional[str]]:
    """
    Comprehensive validation for log submission data.
    
    Args:
        data: Raw request data dictionary
        
    Returns:
        Tuple of (is_valid, cleaned_data, error_message)
        - is_valid: True if all validation passes
        - cleaned_data: Dictionary with validated/converted values
        - error_message: Error description if validation fails
    """
    # Check required fields
    required_fields = ["utc_timestamp", "duration", "instrument"]
    field_error = validate_required_fields(data, required_fields)
    if field_error:
        return False, {}, field_error
    
    # Validate timestamp
    parsed_timestamp, timestamp_error = validate_timestamp_format(data["utc_timestamp"])
    if timestamp_error:
        return False, {}, timestamp_error
    
    # Validate duration
    duration_error = validate_duration(data["duration"])
    if duration_error:
        return False, {}, duration_error
    
    # Validate instrument
    instrument_error = validate_instrument(data["instrument"])
    if instrument_error:
        return False, {}, instrument_error
    
    # Build cleaned data with validated values
    cleaned_data = {
        "utc_timestamp": parsed_timestamp,
        "duration": int(data["duration"]),
        "instrument": data["instrument"].strip(),
    }
    
    # Add optional fields if present (including empty strings)
    if "piece" in data:
        cleaned_data["piece"] = str(data["piece"]).strip() if data["piece"] else ""
    
    if "composer" in data:
        cleaned_data["composer"] = str(data["composer"]).strip() if data["composer"] else ""
    
    if "notes" in data:
        cleaned_data["notes"] = str(data["notes"]).strip() if data["notes"] else ""
    
    return True, cleaned_data, None
