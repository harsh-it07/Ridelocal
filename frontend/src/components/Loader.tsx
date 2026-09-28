interface LoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  center?: boolean;
}

export function Loader({
  message,
  size = "md",
  className = "",
  center = true,
}: LoaderProps) {
  const sizeMap = {
    sm: "32px",
    md: "56px",
    lg: "70px",
  };

  const dimension = sizeMap[size];

  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
      }}
      className={className}
    >
      <div
        className="loader"
        style={{
          width: dimension,
          height: dimension,
        }}
      />
      {message && (
        <p
          style={{
            color: "#F0C4BC",
            fontSize: size === "sm" ? "0.875rem" : "1.0625rem",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: 0,
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (center) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 24px",
          width: "100%",
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
