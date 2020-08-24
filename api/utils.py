from datetime import date


def str_to_date(datestr: str) -> date:
    month, day, year = datestr.split('-')
    return date(int(year), int(month), int(day))


def date_to_str(dateobj: date) -> str:
    return f'{dateobj.month}-{dateobj.day}-{dateobj.year}'
