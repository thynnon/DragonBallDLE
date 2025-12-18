import os
from PIL import Image

# Extensions acceptées
EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

# Configuration de compression
MAX_SIZE = 800  # Taille maximale (largeur ou hauteur)
WEBP_QUALITY = 70  # Qualité WebP (0-100, 85 = bon compromis)

# Dossier courant
FOLDER = os.path.dirname(os.path.abspath(__file__))

# Statistiques
total_before = 0
total_after = 0
file_count = 0

print("🔄 Compression en cours...\n")

for filename in os.listdir(FOLDER):
    if not filename.lower().endswith(EXTENSIONS):
        continue

    file_path = os.path.join(FOLDER, filename)
    name, ext = os.path.splitext(filename)
    
    # Sortie en WebP (beaucoup plus léger)
    output_path = os.path.join(FOLDER, name + ".webp")

    try:
        # Taille originale
        size_before = os.path.getsize(file_path)
        total_before += size_before

        with Image.open(file_path) as img:
            # Convertir en RGB (WebP ne supporte pas bien RGBA avec transparence)
            if img.mode == 'RGBA':
                # Créer un fond blanc pour la transparence
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Redimensionner si l'image est trop grande
            width, height = img.size
            if width > MAX_SIZE or height > MAX_SIZE:
                ratio = min(MAX_SIZE / width, MAX_SIZE / height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
                resize_info = f" [{width}x{height} → {new_size[0]}x{new_size[1]}]"
            else:
                resize_info = ""

            # Sauvegarde en WebP avec compression
            img.save(
                output_path,
                format="WEBP",
                quality=WEBP_QUALITY,
                method=6  # Meilleure compression (plus lent mais plus efficace)
            )

        # Taille après compression
        size_after = os.path.getsize(output_path)
        total_after += size_after

        # Supprime l'ancien fichier
        if file_path != output_path:
            os.remove(file_path)

        # Calcul de la réduction
        reduction = ((size_before - size_after) / size_before * 100)
        file_count += 1
        
        print(f"✔ {filename}{resize_info}")
        print(f"  {size_before/1024:.1f}KB → {size_after/1024:.1f}KB (-{reduction:.1f}%)\n")

    except Exception as e:
        print(f"❌ Erreur avec {filename} : {e}\n")

# Affichage du résumé
print("=" * 60)
print(f"📊 RÉSUMÉ - {file_count} fichiers traités")
print(f"Taille totale avant : {total_before/1024/1024:.2f} MB")
print(f"Taille totale après : {total_after/1024/1024:.2f} MB")
if total_before > 0:
    saved = total_before - total_after
    reduction_total = (saved / total_before * 100)
    print(f"💾 Espace économisé : {saved/1024/1024:.2f} MB ({reduction_total:.1f}%)")
print("=" * 60)
print("✅ Conversion terminée en WebP !")