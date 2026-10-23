import json
import os
import sys

FILENAME = "cards.json"
if __name__ == "__main__":
    with open(FILENAME, "r") as f:
        data = json.load(f)

    max_id = data.get("max_id")

    if not max_id:
        print("max_id not found in cards.json")
        sys.exit(1)

    if len(sys.argv) < 4:
        print(
            "Usage: python add_theme.py <game_name> <artist_name> <theme_name> {theme_type}"
        )
        sys.exit(1)

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

    os.remove(FILENAME)
    with open(FILENAME, "w") as f:
        json.dump(data, f, indent=2)
