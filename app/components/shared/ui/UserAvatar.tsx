/**
 * UserAvatar — Muestra las iniciales del usuario en un círculo de color.
 *
 * Por defecto mientras no haya integración con nube de imágenes.
 * Cuando se integre la foto, basta con agregar la prop `src` y
 * el componente hará fallback a iniciales si la imagen falla.
 */

export interface UserAvatarProps {
  /** Nombre o username del usuario para generar las iniciales */
  name: string;
  /** Diámetro del círculo en px */
  size?: number;
  /** Color principal del degradado (hex). Por defecto azul admin. */
  accentColor?: string;
  /** URL de la foto de perfil (futura integración) */
  src?: string;
  /** Grosor del borde en px */
  borderWidth?: number;
  /** Color del borde */
  borderColor?: string;
  /** Box shadow opcional */
  shadow?: string;
  /** Clase CSS adicional */
  className?: string;
}

/** Obtiene máximo 2 iniciales de un nombre */
function getInitials(name: string): string {
  const clean = name.trim().replace(/_/g, " ");
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0].length >= 2) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] ?? "?").toUpperCase();
}

/** Genera un degradado consistente a partir del color de acento */
function makeGradient(accentColor: string): string {
  return `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`;
}

export default function UserAvatar({
  name,
  size = 36,
  accentColor = "#1d4ed8",
  src,
  borderWidth = 0,
  borderColor = "#ffffff",
  shadow,
  className = "",
}: UserAvatarProps) {
  const initials = getInitials(name || "?");
  const fontSize = size * 0.36;

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
    boxShadow: shadow,
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: makeGradient(accentColor),
  };

  const textStyle: React.CSSProperties = {
    color: "#ffffff",
    fontSize,
    fontWeight: 700,
    fontFamily: "var(--font-poppins), sans-serif",
    lineHeight: 1,
    userSelect: "none",
    letterSpacing: "0.03em",
  };

  // Cuando se integre nube de imágenes, usar <img> con onError fallback
  if (src) {
    return (
      <div style={containerStyle} className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // Fallback: ocultar imagen y mostrar el div con iniciales
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span style={{ ...textStyle, position: "absolute" }}>{initials}</span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <span style={textStyle}>{initials}</span>
    </div>
  );
}
