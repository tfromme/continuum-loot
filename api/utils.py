from datetime import date


def str_to_date_ui(datestr: str) -> date:
    year, month, day = datestr.split('-')
    return date(int(year), int(month), int(day))


def str_to_date_db(datestr: str) -> date:
    month, day, year = datestr.split('-')
    return date(int(year), int(month), int(day))


def date_to_str_ui(dateobj: date) -> str:
    return f'{dateobj.year}-{dateobj.month}-{dateobj.day}'


def date_to_str_db(dateobj: date) -> str:
    return f'{dateobj.month}-{dateobj.day}-{dateobj.year}'
