import json
import os
import sys
from typing import Any


FILENAME = "cards.json"

def open_file() -> Any:
    with open(FILENAME, "r") as f:
        data = json.load(f)

    return data

def write_file(data: Any) -> None:
    os.remove(FILENAME)
    with open(FILENAME, "w") as f:
        json.dump(data, f, indent=2)

def validation(max_id: int | None) -> None:
    if not max_id:
        print("max_id not found in cards.json")
        sys.exit(1)

    if len(sys.argv) < 4:
        print(
            "Usage: python add_theme.py <game_name> <artist_name> <theme_name> {theme_type}"
        )
        sys.exit(1)

def main():
    data = open_file()

    max_id = data.get("max_id")
    validation(max_id)

    game = sys.argv[1]
    artist = sys.argv[2]
    theme = sys.argv[3]
    theme_type = sys.argv[4] if len(sys.argv) > 4 else "normal"

    game_list = data.get("games", [])

    artists = []
    themes = []
    card_slots = []

    for g in game_list:
        if g["id"] == game:
            artists = g.get("artists", [])
            break

    for a in artists:
        if a["name"] == artist:
            themes = a.get("themes", [])
            card_slots = a.get("card_slots", [])
            break

    for t in themes:
        if t["name"] == theme:
            print(f'Theme "{theme}" by "{artist}" already exists for game "{game}".')
            sys.exit(1)

    new_theme = {
        "name": theme,
        "themeType": theme_type,
        "cards": [
            {"globalId": max_id + i, "name": slot} for i, slot in enumerate(card_slots)
        ],
    }

    max_id += len(card_slots)
    data["max_id"] = max_id

    themes.append(new_theme)

    write_file(data)

def list_add():
    data = open_file()

    max_id = data.get("max_id")

    game = "jyp"
    artist = "2PM"
    theme_list: list[str] = [
        "Hold You LE",
        "Champagne LE",
        "On My Way",
        "OK or Not LE",
        "Make it LE",
        "5th Anniv. My House EVENT LE",
        "Game Over",
        "Giv u Class",
        "Even If You Leave Me",
        "Zero Point LE",
        "A.D.T.O.Y.",
        "BLUE HOLE LE",
        "GENTLEMEN",
        "My House",
        "Nobody Else",
        "Go Crazy!",
    ]

    game_list = data.get("games", [])

    artists = []
    themes = []
    card_slots = []

    for g in game_list:
        if g["id"] == game:
            artists = g.get("artists", [])
            break

    for a in artists:
        if a["name"] == artist:
            themes = a.get("themes", [])
            card_slots = a.get("card_slots", [])
            break

    for theme in theme_list:
        for t in themes:
            if t["name"] == theme:
                print(f'Theme "{theme}" by "{artist}" already exists for game "{game}".')
                sys.exit(1)

        new_theme = {
            "name": theme,
            "themeType": "normal",
            "cards": [
                {"globalId": max_id + i, "name": slot} for i, slot in enumerate(card_slots)
            ],
        }

        max_id += len(card_slots)
        data["max_id"] = max_id

        themes.append(new_theme)

    write_file(data)

if __name__ == "__main__":
    if len(sys.argv) == 1:
        list_add()
    else:
        main()
