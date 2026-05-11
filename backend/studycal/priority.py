from datetime import datetime


def calculate_priority(weight_percent: float, due_date: datetime) -> float:
    """
    priority_score = (weight_percent * 0.6) + (urgency_score * 0.4)

    urgency_score:
        <= 1 day  -> 100
        <= 3 days -> 75
        <= 7 days -> 50
        >  7 days -> 25

    Ungraded tasks (weight_percent = 0) are driven purely by urgency.
    """
    now        = datetime.utcnow()
    days_until = (due_date - now).total_seconds() / 86400

    if days_until <= 1:
        urgency = 100
    elif days_until <= 3:
        urgency = 75
    elif days_until <= 7:
        urgency = 50
    else:
        urgency = 25

    return round((weight_percent * 0.6) + (urgency * 0.4), 2)
