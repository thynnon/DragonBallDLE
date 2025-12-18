import os
from PIL import Image

# Extensions acceptées
EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

# Dossier courant (là où est le script)
FOLDER = os.path.dirname(os.path.abspath(__file__))

for filename in os.listdir(FOLDER):
    if not filename.lower().endswith(EXTENSIONS):
        continue

    file_path = os.path.join(FOLDER, filename)
    name, ext = os.path.splitext(filename)
    output_path = os.path.join(FOLDER, name + ".png")

    try:
        with Image.open(file_path) as img:
            # Conversion en RGBA pour éviter les bugs de transparence
            img = img.convert("RGBA")

            # Sauvegarde PNG compressée
            img.save(
                output_path,
                format="PNG",
                optimize=True,
                compress_level=9
            )

        # Supprime l'ancien fichier si ce n'était pas déjà un PNG
        if ext.lower() != ".png":
            os.remove(file_path)

        print(f"✔ Converti : {filename} → {name}.png")

    except Exception as e:
        print(f"❌ Erreur avec {filename} : {e}")

print("\n✅ Conversion terminée.")
