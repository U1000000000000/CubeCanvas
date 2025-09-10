// icons.tsx
import React from "react";

// The icon and color lists can remain as is.
export const PARTICLE_ICONS = [
  "car",
  "rocket",
  "airplane",
  "train",
  "bicycle",
  "scooter",
  "canoe",
  "sailboat",
  "ship",
  "helicopter",
  "satellite",
  "motorcycle",
  "pickup",
  "bird",
  "horse",
  "ball",
  "rollercoaster",
  "skates",
  "drone",
  "ufo",
  "planet",
  "submarine",
  "ferry",
  "football",
  "basketball",
  "tennis",
  "volleyball",
  "baseball",
  "golf",
  "bowling",
];

export const VIBRANT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
];

interface CustomIconProps {
  type: string;
  size: number;
  color: string;
  rotation: number;
  animationPhase: number;
  animate?: boolean; // Prop to control animations
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  type,
  size,
  color,
  rotation,
  animate = false,
}) => {
  const iconStyle = {
    width: size,
    height: size,
    transform: `rotate(${rotation}deg)`,
    filter: `drop-shadow(0 0 4px ${color})`,
  };

  const getIcon = () => {
    switch (type) {
      case "car":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Car body */}
            <path
              d="M5 11h14c1 0 2 1 2 2v4c0 1-1 2-2 2H5c-1 0-2-1-2-2v-4c0-1 1-2 2-2z"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Car top/cabin */}
            <path
              d="M7 11V8c0-1 1-2 2-2h6c1 0 2 1 2 2v3"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Windows */}
            <rect
              x="8"
              y="7"
              width="3"
              height="3"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect
              x="13"
              y="7"
              width="3"
              height="3"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Wheels - with conditional animation */}
            <g transform="rotate(0, 7, 17)">
              <circle cx="7" cy="17" r="2" fill="#333" />
              <circle cx="7" cy="17" r="1.5" fill="#666" />
              <line
                x1="7"
                y1="14.5"
                x2="7"
                y2="19.5"
                stroke="#AAA"
                strokeWidth="0.5"
              />
              <line
                x1="4.5"
                y1="17"
                x2="9.5"
                y2="17"
                stroke="#AAA"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 7 17"
                  to="360 7 17"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g transform="rotate(0, 17, 17)">
              <circle cx="17" cy="17" r="2" fill="#333" />
              <circle cx="17" cy="17" r="1.5" fill="#666" />
              <line
                x1="17"
                y1="14.5"
                x2="17"
                y2="19.5"
                stroke="#AAA"
                strokeWidth="0.5"
              />
              <line
                x1="14.5"
                y1="17"
                x2="19.5"
                y2="17"
                stroke="#AAA"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 17 17"
                  to="360 17 17"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Headlights */}
            <circle cx="3" cy="13" r="0.8" fill="#FFD700" />
            <circle cx="21" cy="13" r="0.8" fill="#FF4444" />
            {/* Grille */}
            <rect x="2" y="12" width="1" height="2" fill="#333" />
          </svg>
        );
      case "rocket":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Rocket body */}
            <path
              d="M12 2L14 8H10L12 2z"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
            />
            <rect
              x="10"
              y="8"
              width="4"
              height="10"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Fins */}
            <path d="M8 15L10 18L10 15z" fill="#FF6B6B" />
            <path d="M16 15L14 18L14 15z" fill="#FF6B6B" />
            {/* Nose cone */}
            <path d="M10 8L12 5L14 8" fill="#FFD700" />
            {/* Window */}
            <circle
              cx="12"
              cy="12"
              r="1.5"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Animated flames */}
            <g>
              <path
                d="M10 18C10 20 11 22 12 22C13 22 14 20 14 18"
                fill="#FF4444"
              />
              <path
                d="M11 19C11 20.5 11.5 21.5 12 21.5C12.5 21.5 13 20.5 13 19"
                fill="#FFA500"
              />
              {animate && (
                <animate
                  attributeName="opacity"
                  from="0.7"
                  to="1"
                  dur="0.5s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="0.7;1;0.7"
                />
              )}
            </g>
            {/* Details */}
            <rect x="10.5" y="10" width="0.3" height="6" fill="#333" />
            <rect x="13.2" y="10" width="0.3" height="6" fill="#333" />
          </svg>
        );
      case "airplane":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Fuselage */}
            <ellipse
              cx="12"
              cy="12"
              rx="8"
              ry="1.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Wings */}
            <ellipse
              cx="12"
              cy="12"
              rx="2"
              ry="6"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Cockpit */}
            <ellipse
              cx="18"
              cy="12"
              rx="2"
              ry="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Tail */}
            <path d="M4 12L6 10V14L4 12z" fill="#FF6B6B" />
            <path d="M5 8L7 10L6 12L5 8z" fill="#FF6B6B" />
            {/* Engine details with subtle animation */}
            <g>
              <circle cx="16" cy="12" r="0.8" fill="#333" />
              <circle cx="8" cy="12" r="0.8" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="0.3 0"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="0 0;0.3 0;0 0"
                />
              )}
            </g>
            {/* Wing lights */}
            <circle cx="12" cy="6" r="0.4" fill="#FF4444" />
            <circle cx="12" cy="18" r="0.4" fill="#00FF00" />
            {/* Exhaust animation */}
            {animate && (
              <g>
                <path d="M14 12 L16 12" stroke="#CCC" strokeWidth="0.5">
                  <animate
                    attributeName="stroke-dasharray"
                    from="0,1"
                    to="2,2"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
                <path d="M10 12 L8 12" stroke="#CCC" strokeWidth="0.5">
                  <animate
                    attributeName="stroke-dasharray"
                    from="0,1"
                    to="2,2"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            )}
          </svg>
        );
      case "train":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Train body */}
            <rect
              x="3"
              y="8"
              width="18"
              height="8"
              rx="2"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Locomotive front */}
            <path d="M3 8C2 8 1 9 1 10V14C1 15 2 16 3 16" fill="#444" />
            {/* Chimney */}
            <rect x="5" y="5" width="2" height="3" fill="#333" />
            <ellipse cx="6" cy="5" rx="1" ry="0.5" fill="#333" />
            {/* Windows */}
            <rect
              x="8"
              y="9"
              width="2.5"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect
              x="11"
              y="9"
              width="2.5"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect
              x="14"
              y="9"
              width="2.5"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect
              x="17"
              y="9"
              width="2.5"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Wheels */}
            <g transform="rotate(0, 6, 18)">
              <circle cx="6" cy="18" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 6 18"
                  to="360 6 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g transform="rotate(0, 10, 18)">
              <circle cx="10" cy="18" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 10 18"
                  to="360 10 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g transform="rotate(0, 14, 18)">
              <circle cx="14" cy="18" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 14 18"
                  to="360 14 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g transform="rotate(0, 18, 18)">
              <circle cx="18" cy="18" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Headlight */}
            <circle cx="2" cy="12" r="1" fill="#FFD700" />
            {/* Animated steam */}
            {animate && (
              <g>
                <circle cx="6" cy="5" r="0" fill="#DDD" opacity="0">
                  <animate
                    attributeName="cy"
                    from="5"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.7"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="7" cy="5" r="0" fill="#DDD" opacity="0">
                  <animate
                    attributeName="cy"
                    from="5"
                    to="0"
                    dur="2.2s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.8"
                    dur="2.2s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="2.2s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
          </svg>
        );
      case "bicycle":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Wheels with conditional rotation animation */}
            <g>
              <circle
                cx="6"
                cy="18"
                r="3.5"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M6 14.5L6 21.5M2.5 18L9.5 18M3.5 15.5L8.5 20.5M8.5 15.5L3.5 20.5"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 6 18"
                  to="360 6 18"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g>
              <circle
                cx="18"
                cy="18"
                r="3.5"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M18 14.5L18 21.5M14.5 18L21.5 18M15.5 15.5L20.5 20.5M20.5 15.5L15.5 20.5"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Frame */}
            <path
              d="M6 18L12 8L18 18"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            <path d="M8 15L16 15" fill="none" stroke={color} strokeWidth="2" />
            <path d="M12 8L12 15" fill="none" stroke={color} strokeWidth="2" />
            {/* Seat */}
            <ellipse cx="12" cy="7" rx="2" ry="0.5" fill="#654321" />
            <path d="M12 7.5L12 8" stroke="#333" strokeWidth="1" />
            {/* Handlebars */}
            <path d="M10 8L14 8" stroke="#333" strokeWidth="1.5" />
            <circle cx="10" cy="8" r="0.5" fill="#333" />
            <circle cx="14" cy="8" r="0.5" fill="#333" />
            {/* Pedals with conditional rotation */}
            <g>
              <ellipse cx="12" cy="15" rx="0.8" ry="0.3" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 15"
                  to="360 12 15"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
          </svg>
        );
      case "helicopter":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Main rotor with conditional rotation */}
            <g>
              <ellipse
                cx="12"
                cy="8"
                rx="10"
                ry="0.5"
                fill="#333"
                opacity="0.3"
              />
              <line
                x1="2"
                y1="8"
                x2="22"
                y2="8"
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 8"
                  to="360 12 8"
                  dur="0.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Mast */}
            <rect x="11.7" y="8" width="0.6" height="2" fill="#333" />
            {/* Cockpit */}
            <ellipse
              cx="12"
              cy="13"
              rx="4"
              ry="3"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Windows */}
            <path
              d="M8.5 11C8.5 12 9.5 13 10.5 13H13.5C14.5 13 15.5 12 15.5 11"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Tail boom */}
            <rect x="16" y="12" width="6" height="2" fill="#666" />
            {/* Tail rotor with conditional rotation */}
            <g>
              <ellipse
                cx="22"
                cy="13"
                rx="0.3"
                ry="2"
                fill="#333"
                opacity="0.3"
              />
              <line
                x1="22"
                y1="11"
                x2="22"
                y2="15"
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 22 13"
                  to="360 22 13"
                  dur="0.2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Landing skids */}
            <ellipse cx="10" cy="16.5" rx="1.5" ry="0.3" fill="#333" />
            <ellipse cx="14" cy="16.5" rx="1.5" ry="0.3" fill="#333" />
            <rect x="10" y="15.8" width="0.3" height="1" fill="#333" />
            <rect x="13.7" y="15.8" width="0.3" height="1" fill="#333" />
          </svg>
        );
      case "ufo":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Main saucer body */}
            <ellipse
              cx="12"
              cy="14"
              rx="9"
              ry="3"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Top dome */}
            <ellipse
              cx="12"
              cy="11"
              rx="4"
              ry="3"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
              opacity="0.8"
            />
            {/* Windows around dome */}
            <circle cx="9" cy="11" r="0.8" fill="#87CEEB" />
            <circle cx="12" cy="10" r="0.8" fill="#87CEEB" />
            <circle cx="15" cy="11" r="0.8" fill="#87CEEB" />
            {/* Bottom lights with conditional pulsing animation */}
            <circle cx="8" cy="15.5" r="0.6" fill="#FFD700">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0.3"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx="12" cy="16" r="0.6" fill="#00FF00">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="0.3"
                  to="1"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx="16" cy="15.5" r="0.6" fill="#FF4444">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0.3"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {/* Light beams */}
            <path d="M8 16.5L7 20L9 20Z" fill="#FFD700" opacity="0.3" />
            <path d="M12 16.8L11 20L13 20Z" fill="#00FF00" opacity="0.3" />
            <path d="M16 16.5L15 20L17 20Z" fill="#FF4444" opacity="0.3" />
            {/* Surface details */}
            <ellipse
              cx="12"
              cy="14"
              rx="7"
              ry="1.5"
              fill="none"
              stroke="#666"
              strokeWidth="0.3"
            />
            <ellipse
              cx="12"
              cy="14"
              rx="5"
              ry="1"
              fill="none"
              stroke="#666"
              strokeWidth="0.3"
            />
          </svg>
        );
      case "bird":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Bird body */}
            <ellipse
              cx="12"
              cy="12"
              rx="3"
              ry="1.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Head */}
            <circle
              cx="16"
              cy="11"
              r="2"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Beak */}
            <path d="M18 11L20 10.5L18.5 11.5Z" fill="#FFA500" />
            {/* Eye */}
            <circle cx="16.5" cy="10.5" r="0.4" fill="#333" />
            <circle cx="16.7" cy="10.3" r="0.1" fill="white" />
            {/* Wings with conditional flapping animation */}
            <g>
              <ellipse
                cx="10"
                cy="11"
                rx="4"
                ry="1.5"
                fill="#E8E8E8"
                stroke="#333"
                strokeWidth="0.5"
              >
                {animate && (
                  <animate
                    attributeName="ry"
                    from="1.5"
                    to="2.5"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
              <ellipse
                cx="14"
                cy="13"
                rx="4"
                ry="1.5"
                fill="#E8E8E8"
                stroke="#333"
                strokeWidth="0.5"
              >
                {animate && (
                  <animate
                    attributeName="ry"
                    from="1.5"
                    to="2.5"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                )}
              </ellipse>
            </g>
            {/* Wing feather details */}
            <path d="M6 11L8 10L9 11L8 12L6 11Z" fill={color} />
            <path d="M18 13L20 12L21 13L20 14L18 13Z" fill={color} />
            {/* Tail */}
            <path
              d="M9 12L7 14L8 15L10 13Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Legs */}
            <line
              x1="13"
              y1="13.5"
              x2="13.5"
              y2="15"
              stroke="#FFA500"
              strokeWidth="1"
            />
            <line
              x1="11"
              y1="13.5"
              x2="11.5"
              y2="15"
              stroke="#FFA500"
              strokeWidth="1"
            />
            {/* Feet */}
            <path
              d="M13.5 15L13.2 15.5M13.5 15L13.8 15.5M13.5 15L13.5 15.7"
              stroke="#FFA500"
              strokeWidth="0.5"
            />
            <path
              d="M11.5 15L11.2 15.5M11.5 15L11.8 15.5M11.5 15L11.5 15.7"
              stroke="#FFA500"
              strokeWidth="0.5"
            />
          </svg>
        );
      case "ball":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Soccer ball base */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="10"
                fill={color}
                stroke="#333"
                strokeWidth="1"
              />
              {/* Pentagon pattern */}
              <polygon points="12,6 14.5,8 13.5,11 10.5,11 9.5,8" fill="#333" />
              <polygon
                points="12,18 14.5,16 13.5,13 10.5,13 9.5,16"
                fill="#333"
              />
              <polygon points="6,12 8,9.5 11,10.5 11,13.5 8,14.5" fill="#333" />
              <polygon
                points="18,12 16,9.5 13,10.5 13,13.5 16,14.5"
                fill="#333"
              />
              {/* Hexagon patterns */}
              <polygon
                points="12,2 15,4 14,7 10,7 9,4"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              <polygon
                points="22,12 20,9 17,10 17,14 20,15"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              <polygon
                points="12,22 15,20 14,17 10,17 9,20"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              <polygon
                points="2,12 4,9 7,10 7,14 4,15"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion lines */}
            <path
              d="M20,8 Q22,10 20,12"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M21,14 Q23,16 21,18"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
          </svg>
        );
      case "satellite":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Main body */}
            <rect
              x="10"
              y="9"
              width="4"
              height="6"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Solar panels */}
            <g>
              <rect
                x="6"
                y="10"
                width="3"
                height="4"
                fill="#4169E1"
                stroke="#333"
                strokeWidth="0.3"
              />
              <rect
                x="15"
                y="10"
                width="3"
                height="4"
                fill="#4169E1"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animate
                  attributeName="opacity"
                  from="0.8"
                  to="1"
                  dur="1.5s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="0.8;1;0.8"
                />
              )}
            </g>
            {/* Panel grid lines */}
            <line
              x1="6.5"
              y1="10"
              x2="6.5"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            <line
              x1="7"
              y1="10"
              x2="7"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            <line
              x1="7.5"
              y1="10"
              x2="7.5"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            <line
              x1="15.5"
              y1="10"
              x2="15.5"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            <line
              x1="16"
              y1="10"
              x2="16"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            <line
              x1="16.5"
              y1="10"
              x2="16.5"
              y2="14"
              stroke="#333"
              strokeWidth="0.1"
            />
            {/* Antenna */}
            <line x1="12" y1="9" x2="12" y2="6" stroke="#333" strokeWidth="1" />
            <circle cx="12" cy="6" r="1" fill="#FFD700" />
            {/* Communication dish */}
            <ellipse
              cx="12"
              cy="4.5"
              rx="1.5"
              ry="0.8"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Thrusters */}
            <rect x="9.7" y="15" width="0.6" height="1.5" fill="#666" />
            <rect x="11.2" y="15" width="0.6" height="1.5" fill="#666" />
            <rect x="12.7" y="15" width="0.6" height="1.5" fill="#666" />
            {/* Body details */}
            <rect x="10.5" y="10" width="0.3" height="4" fill="#666" />
            <rect x="11.5" y="10" width="0.3" height="4" fill="#666" />
            <rect x="12.5" y="10" width="0.3" height="4" fill="#666" />
            <rect x="13.2" y="10" width="0.3" height="4" fill="#666" />
            {/* Signal waves */}
            <path
              d="M15,7 Q18,9 15,11"
              stroke="#00FF00"
              strokeWidth="0.5"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M16,6 Q20,8 16,10"
              stroke="#00FF00"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
          </svg>
        );
      case "scooter":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Deck/platform */}
            <rect
              x="8"
              y="13"
              width="8"
              height="1.5"
              rx="0.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Handlebar post */}
            <rect x="15.7" y="6" width="0.6" height="7.5" fill="#666" />
            {/* Handlebars */}
            <path d="M13 6L18 6" stroke="#333" strokeWidth="1.5" />
            <circle cx="13" cy="6" r="0.5" fill="#333" />
            <circle cx="18" cy="6" r="0.5" fill="#333" />
            {/* Steering column */}
            <rect x="15.5" y="6" width="1" height="0.8" fill="#333" />
            {/* Front wheel */}
            <g>
              <circle
                cx="18"
                cy="17"
                r="2.5"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <circle
                cx="18"
                cy="17"
                r="1.8"
                fill="none"
                stroke="#666"
                strokeWidth="0.3"
              />
              <path
                d="M18 14.5L18 19.5M15.5 17L20.5 17"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 17"
                  to="360 18 17"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Back wheel */}
            <g>
              <circle
                cx="6"
                cy="17"
                r="2.5"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <circle
                cx="6"
                cy="17"
                r="1.8"
                fill="none"
                stroke="#666"
                strokeWidth="0.3"
              />
              <path
                d="M6 14.5L6 19.5M3.5 17L8.5 17"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 6 17"
                  to="360 6 17"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Brake */}
            <rect x="17" y="14.5" width="0.3" height="1" fill="#FF4444" />
            {/* Footboard grip */}
            <rect x="9" y="13.2" width="6" height="0.2" fill="#333" />
            <rect x="9" y="13.6" width="6" height="0.2" fill="#333" />
          </svg>
        );
      case "canoe":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Canoe hull */}
            <ellipse
              cx="12"
              cy="14"
              rx="10"
              ry="2"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Hull shading and interior */}
            <ellipse
              cx="12"
              cy="13.5"
              rx="9"
              ry="1.5"
              fill="#E8E8E8"
              opacity="0.7"
            />
            <ellipse cx="12" cy="14" rx="8.5" ry="1.5" fill="#8B4513" />
            {/* Seats */}
            <ellipse cx="8" cy="13.8" rx="1.5" ry="0.3" fill="#654321" />
            <ellipse cx="16" cy="13.8" rx="1.5" ry="0.3" fill="#654321" />
            {/* Paddle with conditional animation */}
            <g>
              <rect x="5" y="8" width="0.4" height="8" fill="#8B4513" />
              <ellipse
                cx="5.2"
                cy="7"
                rx="1"
                ry="2"
                fill="#654321"
                stroke="#333"
                strokeWidth="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 5 12"
                  to="10 5 12"
                  dur="1s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="0;10;0"
                />
              )}
            </g>
            {/* Paddle in water */}
            <ellipse
              cx="5.2"
              cy="16.5"
              rx="0.8"
              ry="1.5"
              fill="#4169E1"
              opacity="0.3"
            />
            {/* Water ripples with conditional animation */}
            <g>
              <ellipse
                cx="12"
                cy="16.5"
                rx="12"
                ry="1"
                fill="none"
                stroke="#4169E1"
                strokeWidth="0.3"
                opacity="0.5"
              />
              <ellipse
                cx="12"
                cy="17"
                rx="14"
                ry="0.8"
                fill="none"
                stroke="#4169E1"
                strokeWidth="0.2"
                opacity="0.3"
              />
              {animate && (
                <animate
                  attributeName="cy"
                  from="17"
                  to="16"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Canoe bow and stern details */}
            <path
              d="M2.5 14C2.2 13.8 2 13.5 2 13.2C2 12.9 2.2 12.6 2.5 12.4"
              stroke="#333"
              strokeWidth="0.5"
            />
            <path
              d="M21.5 14C21.8 13.8 22 13.5 22 13.2C22 12.9 21.8 12.6 21.5 12.4"
              stroke="#333"
              strokeWidth="0.5"
            />
          </svg>
        );
      case "sailboat":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Hull with conditional bobbing animation */}
            <g>
              <path
                d="M6 16C6 17 7 18 8 18H16C17 18 18 17 18 16L17 14H7L6 16Z"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="0 0.5"
                  dur="2s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="0 0;0 0.5;0 0"
                />
              )}
            </g>
            {/* Mast */}
            <rect x="11.7" y="4" width="0.6" height="10" fill="#8B4513" />
            {/* Main sail */}
            <path
              d="M12 4L12 12L20 10L18 6L12 4Z"
              fill="white"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Jib sail */}
            <path
              d="M12 6L12 10L6 8L8 7L12 6Z"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Boom */}
            <rect x="12" y="11.7" width="6" height="0.3" fill="#8B4513" />
            {/* Sail details */}
            <path
              d="M13 5L13 11M15 6L15 10M17 7L17 9"
              stroke="#666"
              strokeWidth="0.2"
            />
            <path d="M11 7L11 9M9 7.5L9 8.5" stroke="#666" strokeWidth="0.2" />
            {/* Water */}
            <path
              d="M2 18C4 17 8 19 12 18C16 17 20 19 22 18"
              stroke="#4169E1"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M1 19C3 18.5 7 19.5 11 19C15 18.5 19 19.5 23 19"
              stroke="#4169E1"
              strokeWidth="0.8"
              fill="none"
              opacity="0.7"
            />
            {/* Flag */}
            <rect x="12.3" y="4" width="2" height="1.5" fill="#FF4444" />
            {/* Hull details */}
            <ellipse
              cx="12"
              cy="15.5"
              rx="5"
              ry="0.5"
              fill="#666"
              opacity="0.3"
            />
          </svg>
        );
      case "ship":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Hull */}
            <path
              d="M3 15C3 16 4 17 5 17H19C20 17 21 16 21 15V13H3V15Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Ship superstructure */}
            <rect
              x="8"
              y="8"
              width="8"
              height="5"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Bridge */}
            <rect
              x="10"
              y="6"
              width="4"
              height="2"
              fill="white"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Windows */}
            <rect
              x="9"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="11"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="13"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="10.5"
              y="6.5"
              width="1"
              height="0.8"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="12.5"
              y="6.5"
              width="1"
              height="0.8"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            {/* Smokestacks */}
            <rect x="13.5" y="4" width="1" height="4" fill="#666" />
            <rect x="15" y="3.5" width="1" height="4.5" fill="#666" />
            {/* Animated smoke */}
            {animate && (
              <g>
                <circle cx="14" cy="4" r="0" fill="#DDD" opacity="0.6">
                  <animate
                    attributeName="cy"
                    from="4"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="15.5" cy="3.5" r="0" fill="#DDD" opacity="0.7">
                  <animate
                    attributeName="cy"
                    from="3.5"
                    to="-1"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="2"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.7"
                    to="0"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
            {/* Mast */}
            <rect x="11.7" y="2" width="0.6" height="4" fill="#8B4513" />
            {/* Radar/antenna */}
            <circle cx="12" cy="2" r="0.5" fill="#FFD700" />
            <rect x="11.8" y="1.5" width="0.4" height="1" fill="#333" />
            {/* Hull waterline */}
            <rect x="3" y="16" width="18" height="0.5" fill="#FF4444" />
            {/* Portholes */}
            <circle cx="6" cy="14" r="0.4" fill="#87CEEB" />
            <circle cx="8" cy="14" r="0.4" fill="#87CEEB" />
            <circle cx="16" cy="14" r="0.4" fill="#87CEEB" />
            <circle cx="18" cy="14" r="0.4" fill="#87CEEB" />
            {/* Water waves */}
            <path
              d="M1 18C5 17 11 19 17 18C20 17.5 22 18.5 24 18"
              stroke="#4169E1"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        );
      case "motorcycle":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Front wheel */}
            <g>
              <circle
                cx="18"
                cy="17"
                r="3"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <circle
                cx="18"
                cy="17"
                r="2.2"
                fill="none"
                stroke="#666"
                strokeWidth="0.5"
              />
              <circle cx="18" cy="17" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 17"
                  to="360 18 17"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Back wheel */}
            <g>
              <circle
                cx="6"
                cy="17"
                r="3"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <circle
                cx="6"
                cy="17"
                r="2.2"
                fill="none"
                stroke="#666"
                strokeWidth="0.5"
              />
              <circle cx="6" cy="17" r="1.5" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 6 17"
                  to="360 6 17"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Spokes */}
            <path
              d="M18 14L18 20M15 17L21 17M16 15L20 19M20 15L16 19"
              stroke="#666"
              strokeWidth="0.3"
            />
            <path
              d="M6 14L6 20M3 17L9 17M4 15L8 19M8 15L4 19"
              stroke="#666"
              strokeWidth="0.3"
            />
            {/* Frame */}
            <path
              d="M6 17L12 10L18 17"
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            <path d="M12 10L12 17" fill="none" stroke={color} strokeWidth="2" />
            {/* Gas tank */}
            <ellipse
              cx="12"
              cy="12"
              rx="3"
              ry="1.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Seat */}
            <ellipse cx="10" cy="10.5" rx="2" ry="0.8" fill="#654321" />
            {/* Handlebars */}
            <path d="M10 8L14 8" stroke="#333" strokeWidth="1.5" />
            <circle cx="10" cy="8" r="0.5" fill="#333" />
            <circle cx="14" cy="8" r="0.5" fill="#333" />
            {/* Front fork */}
            <path d="M14 8L18 14" stroke="#666" strokeWidth="1.5" />
            {/* Exhaust pipe with animated smoke */}
            <path d="M8 15C6 15.5 4 16 2 17" stroke="#666" strokeWidth="1.5" />
            <circle cx="2" cy="17" r="0.3" fill="#333" />
            {animate && (
              <g>
                <circle cx="2" cy="17" r="0" fill="#DDD" opacity="0.6">
                  <animate
                    attributeName="cx"
                    from="2"
                    to="-2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="2" cy="17" r="0" fill="#DDD" opacity="0.5">
                  <animate
                    attributeName="cx"
                    from="2"
                    to="-3"
                    dur="2.5s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.8"
                    dur="2.5s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="2.5s"
                    begin="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
            {/* Headlight */}
            <circle
              cx="16"
              cy="10"
              r="0.8"
              fill="#FFD700"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Engine */}
            <rect x="10" y="14" width="2" height="2" fill="#333" />
          </svg>
        );
      case "pickup":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Truck bed */}
            <rect
              x="3"
              y="11"
              width="6"
              height="4"
              fill="#666"
              stroke="#333"
              strokeWidth="0.5"
            />
            <rect x="3" y="11" width="6" height="1" fill="#888" />
            {/* Cab */}
            <rect
              x="9"
              y="8"
              width="6"
              height="7"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Cab roof */}
            <path
              d="M9 8L11 6L13 6L15 8"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Windows */}
            <rect
              x="10"
              y="8.5"
              width="2"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect
              x="12.5"
              y="8.5"
              width="2"
              height="2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Windshield */}
            <path
              d="M11 6.2L11 8L13 8L13 6.2"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Hood */}
            <rect
              x="15"
              y="10"
              width="4"
              height="5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Grille */}
            <rect x="19" y="11" width="1" height="3" fill="#333" />
            <rect x="19.2" y="11.5" width="0.6" height="0.3" fill="#666" />
            <rect x="19.2" y="12.2" width="0.6" height="0.3" fill="#666" />
            <rect x="19.2" y="12.9" width="0.6" height="0.3" fill="#666" />
            {/* Wheels */}
            <g>
              <circle cx="7" cy="17" r="2" fill="#333" />
              <circle cx="7" cy="17" r="1.5" fill="#666" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 7 17"
                  to="360 7 17"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            <g>
              <circle cx="17" cy="17" r="2" fill="#333" />
              <circle cx="17" cy="17" r="1.5" fill="#666" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 17 17"
                  to="360 17 17"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Headlights */}
            <circle cx="20" cy="12" r="0.8" fill="#FFD700" />
            <circle cx="20" cy="13.5" r="0.8" fill="#FFD700" />
            {/* Taillights */}
            <circle cx="3" cy="12.5" r="0.4" fill="#FF4444" />
            <circle cx="3" cy="13.5" r="0.4" fill="#FF4444" />
            {/* Bed details */}
            <rect x="3.5" y="11.5" width="5" height="0.2" fill="#333" />
            <rect x="4" y="12" width="4" height="0.2" fill="#333" />
          </svg>
        );
      case "horse":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Horse body */}
            <ellipse
              cx="10"
              cy="14"
              rx="4"
              ry="2.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Horse neck */}
            <ellipse
              cx="13"
              cy="10"
              rx="1.5"
              ry="3"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Horse head */}
            <ellipse
              cx="15"
              cy="7"
              rx="2"
              ry="2.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Muzzle */}
            <ellipse
              cx="17"
              cy="8"
              rx="0.8"
              ry="1"
              fill={color}
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Ears */}
            <path
              d="M14 5L14.8 3.5L15.6 5Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.3"
            />
            <path
              d="M15.4 5L16.2 3.5L17 5Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Eyes */}
            <circle cx="15.5" cy="6.5" r="0.4" fill="#333" />
            <circle cx="15.7" cy="6.3" r="0.1" fill="white" />
            {/* Nostril */}
            <ellipse cx="17.3" cy="8.2" rx="0.2" ry="0.3" fill="#333" />
            {/* Mane */}
            <path
              d="M13.5 5C12 4 11 6 10.5 8C11 8.5 12 7 13 6.5"
              fill="#654321"
            />
            <path
              d="M14.5 4C13.2 3.2 12.5 5 12 7C12.5 7.5 13.5 6 14 5.5"
              fill="#654321"
            />
            {/* Front legs */}
            <rect x="12.5" y="16" width="0.8" height="4" fill={color} />
            <rect x="14" y="16" width="0.8" height="4" fill={color} />
            {/* Back legs */}
            <rect x="7.5" y="16" width="0.8" height="4" fill={color} />
            <rect x="9" y="16" width="0.8" height="4" fill={color} />
            {/* Hooves */}
            <ellipse cx="12.9" cy="20.3" rx="0.6" ry="0.3" fill="#333" />
            <ellipse cx="14.4" cy="20.3" rx="0.6" ry="0.3" fill="#333" />
            <ellipse cx="7.9" cy="20.3" rx="0.6" ry="0.3" fill="#333" />
            <ellipse cx="9.4" cy="20.3" rx="0.6" ry="0.3" fill="#333" />
            {/* Tail */}
            <path
              d="M6 14C4 14.5 3 16 2 18C3 18 4.5 16.5 5.5 15"
              fill="#654321"
            />
            {/* Saddle */}
            <ellipse
              cx="10"
              cy="12.5"
              rx="2.5"
              ry="1"
              fill="#8B4513"
              opacity="0.8"
            />
            {/* Bridle */}
            <path
              d="M16 7.5C16.5 7 17 6.5 17 6"
              stroke="#654321"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        );
      case "rollercoaster":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Track structure */}
            <path
              d="M2 18C4 12 8 8 12 10C16 12 20 8 22 14"
              fill="none"
              stroke="#666"
              strokeWidth="2"
            />
            <path
              d="M2 18.5C4 12.5 8 8.5 12 10.5C16 12.5 20 8.5 22 14.5"
              fill="none"
              stroke="#666"
              strokeWidth="1"
            />
            {/* Support pillars */}
            <rect x="5.8" y="14" width="0.4" height="6" fill="#666" />
            <rect x="11.8" y="10" width="0.4" height="10" fill="#666" />
            <rect x="17.8" y="12" width="0.4" height="8" fill="#666" />
            {/* Animated Car */}
            <g>
              <path d="M10 8.5 C10.5 8.5 11.5 9 12 9 C12.5 9 13.5 8.5 14 8.5 L14 10.5 C13.5 10.5 12.5 11 12 11 C11.5 11 10.5 10.5 10 10.5 Z" />
              <rect
                x="10"
                y="8.5"
                width="4"
                height="2"
                rx="0.5"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              >
                {animate && (
                  <animateMotion
                    path="M-10 10 C-8 4 -4 0 0 2 C4 4 8 0 10 6"
                    dur="4s"
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                )}
              </rect>
              {/* Passengers and Safety bar */}
              <circle cx="11" cy="7.8" r="0.6" fill="#FFB6C1" />
              <circle cx="13" cy="7.8" r="0.6" fill="#FFB6C1" />
              <rect x="10.2" y="8.2" width="3.6" height="0.2" fill="#333" />
            </g>
            {/* Track rails */}
            <path
              d="M2 17.8C4 11.8 8 7.8 12 9.8C16 11.8 20 7.8 22 13.8"
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
            />
            <path
              d="M2 18.2C4 12.2 8 8.2 12 10.2C16 12.2 20 8.2 22 14.2"
              fill="none"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Motion blur/speed lines */}
            <path
              d="M8 9L6 9.5M7 10L5 10.5M6 11L4 11.5"
              stroke="#333"
              strokeWidth="0.3"
              opacity="0.5"
            />
            {/* Ground */}
            <rect
              x="0"
              y="20"
              width="24"
              height="2"
              fill="#90EE90"
              opacity="0.3"
            />
            {/* Excitement effects */}
            <path
              d="M11.5 6C11.2 5.5 11.8 5.2 12 5.8"
              stroke="#FFD700"
              strokeWidth="0.5"
            />
            <path
              d="M12.5 6.2C12.2 5.7 12.8 5.4 13 6"
              stroke="#FFD700"
              strokeWidth="0.5"
            />
          </svg>
        );
      case "skates":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Skate boot */}
            <path
              d="M8 8C6 8 5 10 5 12V15H15V12C15 10 14 8 12 8H8Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Boot top */}
            <path
              d="M6 8C6 6 7 5 9 5H11C13 5 14 6 14 8"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Laces */}
            <path
              d="M7 6L12 6M7.5 7L11.5 7M8 8L11 8"
              stroke="white"
              strokeWidth="0.5"
            />
            <circle cx="6.8" cy="6" r="0.2" fill="#666" />
            <circle cx="12.2" cy="6" r="0.2" fill="#666" />
            <circle cx="7.3" cy="7" r="0.2" fill="#666" />
            <circle cx="11.7" cy="7" r="0.2" fill="#666" />
            {/* Blade */}
            <rect
              x="4"
              y="15"
              width="12"
              height="0.8"
              fill="#C0C0C0"
              stroke="#333"
              strokeWidth="0.3"
            />
            <rect x="3.5" y="15.4" width="13" height="0.2" fill="#E8E8E8" />
            {/* Blade mounting */}
            <rect x="6" y="14.5" width="0.4" height="1" fill="#333" />
            <rect x="8" y="14.5" width="0.4" height="1" fill="#333" />
            <rect x="10" y="14.5" width="0.4" height="1" fill="#333" />
            <rect x="12" y="14.5" width="0.4" height="1" fill="#333" />
            {/* Ankle support */}
            <ellipse
              cx="10"
              cy="10"
              rx="4"
              ry="1"
              fill="none"
              stroke="#333"
              strokeWidth="0.3"
            />
            {/* Speed lines */}
            <g>
              <path
                d="M1 16L3 15.5M0 17L2 16.5M1.5 18L3.5 17.5"
                stroke="#4169E1"
                strokeWidth="0.5"
                opacity="0.7"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="0 0"
                  to="24 0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Ice shavings */}
            <ellipse
              cx="17"
              cy="16.5"
              rx="1.5"
              ry="0.3"
              fill="white"
              opacity="0.8"
            />
            <ellipse
              cx="18.5"
              cy="17"
              rx="1"
              ry="0.2"
              fill="white"
              opacity="0.6"
            />
            {/* Boot details */}
            <path d="M5.5 11L14.5 11" stroke="#666" strokeWidth="0.3" />
            <path d="M6 13L14 13" stroke="#666" strokeWidth="0.3" />
          </svg>
        );
      case "drone":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Central body */}
            <rect
              x="10"
              y="10"
              width="4"
              height="4"
              rx="0.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Arms */}
            <rect x="6" y="11.5" width="4.5" height="1" fill="#666" />
            <rect x="13.5" y="11.5" width="4.5" height="1" fill="#666" />
            <rect x="11.5" y="6" width="1" height="4.5" fill="#666" />
            <rect x="11.5" y="13.5" width="1" height="4.5" fill="#666" />
            {/* Motors */}
            <circle cx="6" cy="6" r="1.2" fill="#333" />
            <circle cx="18" cy="6" r="1.2" fill="#333" />
            <circle cx="6" cy="18" r="1.2" fill="#333" />
            <circle cx="18" cy="18" r="1.2" fill="#333" />
            {/* Propellers with conditional rotation animation */}
            <g>
              <ellipse
                cx="6"
                cy="6"
                rx="3"
                ry="0.8"
                fill="#E8E8E8"
                opacity="0.6"
              />
              <ellipse
                cx="18"
                cy="6"
                rx="3"
                ry="0.8"
                fill="#E8E8E8"
                opacity="0.6"
              />
              <ellipse
                cx="6"
                cy="18"
                rx="3"
                ry="0.8"
                fill="#E8E8E8"
                opacity="0.6"
              />
              <ellipse
                cx="18"
                cy="18"
                rx="3"
                ry="0.8"
                fill="#E8E8E8"
                opacity="0.6"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Camera gimbal */}
            <circle cx="12" cy="15" r="1.5" fill="#333" />
            <circle cx="12" cy="15" r="1" fill="#444" />
            <circle cx="12" cy="15" r="0.6" fill="#87CEEB" />
            {/* LED lights with conditional animation */}
            <circle cx="10.5" cy="10.5" r="0.3" fill="#00FF00">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0.2"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx="13.5" cy="10.5" r="0.3" fill="#FF4444">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="0.2"
                  to="1"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx="10.5" cy="13.5" r="0.3" fill="#00FF00">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="1"
                  to="0.2"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <circle cx="13.5" cy="13.5" r="0.3" fill="#FF4444">
              {animate && (
                <animate
                  attributeName="opacity"
                  from="0.2"
                  to="1"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {/* Antenna */}
            <rect x="11.8" y="7" width="0.4" height="2" fill="#333" />
            <circle cx="12" cy="6.8" r="0.3" fill="#FFD700" />
            {/* Battery */}
            <rect x="10.5" y="11" width="3" height="1.5" fill="#4169E1" />
            <rect x="10.7" y="11.2" width="0.3" height="0.4" fill="#FFD700" />
            <rect x="12.8" y="11.2" width="0.3" height="0.4" fill="#333" />
          </svg>
        );
      case "planet":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Planet body */}
            <circle
              cx="12"
              cy="12"
              r="8"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Planet surface details */}
            <circle cx="12" cy="12" r="6.5" fill="#E8E8E8" opacity="0.3" />
            <circle cx="12" cy="12" r="5" fill="#DDD" opacity="0.4" />
            {/* Craters */}
            <circle cx="9" cy="10" r="1.2" fill="#999" opacity="0.6" />
            <circle cx="15" cy="14" r="0.8" fill="#999" opacity="0.6" />
            <circle cx="14" cy="8" r="0.6" fill="#999" opacity="0.6" />
            <circle cx="8" cy="15" r="1" fill="#999" opacity="0.6" />
            {/* Rings with conditional animation */}
            <g>
              <ellipse
                cx="12"
                cy="12"
                rx="12"
                ry="3"
                fill="none"
                stroke="#FFD700"
                strokeWidth="1"
                opacity="0.7"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="13"
                ry="3.5"
                fill="none"
                stroke="#FFD700"
                strokeWidth="0.5"
                opacity="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Ring shadow on planet */}
            <ellipse cx="12" cy="8" rx="8" ry="2" fill="#666" opacity="0.2" />
            {/* Atmosphere glow */}
            <circle
              cx="12"
              cy="12"
              r="8.5"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity="0.3"
            />
          </svg>
        );
      case "submarine":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Main hull */}
            <ellipse
              cx="12"
              cy="14"
              rx="9"
              ry="3"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Conning tower */}
            <rect
              x="10"
              y="10"
              width="4"
              height="4"
              rx="0.5"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Periscope */}
            <rect x="11.7" y="7" width="0.6" height="3" fill="#666" />
            <circle cx="12" cy="7" r="0.4" fill="#87CEEB" />
            {/* Windows/portholes */}
            <circle
              cx="8"
              cy="14"
              r="0.6"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <circle
              cx="12"
              cy="14"
              r="0.6"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <circle
              cx="16"
              cy="14"
              r="0.6"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            {/* Conning tower windows */}
            <rect
              x="10.5"
              y="11"
              width="1"
              height="0.8"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="12.5"
              y="11"
              width="1"
              height="0.8"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            {/* Propeller with conditional rotation animation */}
            <g>
              <ellipse
                cx="3"
                cy="14"
                rx="0.8"
                ry="2"
                fill="#666"
                opacity="0.6"
              />
              <line
                x1="3"
                y1="12"
                x2="3"
                y2="16"
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 3 14"
                  to="360 3 14"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Rudder */}
            <path d="M3 11L4 9L5 11L4 13Z" fill="#666" />
            {/* Hull details */}
            <ellipse
              cx="12"
              cy="13"
              rx="8"
              ry="1"
              fill="#E8E8E8"
              opacity="0.5"
            />
            <rect x="6" y="13.7" width="12" height="0.3" fill="#666" />
            {/* Water bubbles with conditional animation */}
            {animate && (
              <g>
                <circle cx="20" cy="12" r="0.4" fill="#87CEEB" opacity="0">
                  <animate
                    attributeName="cy"
                    from="12"
                    to="10"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="21" cy="14" r="0.3" fill="#87CEEB" opacity="0">
                  <animate
                    attributeName="cy"
                    from="14"
                    to="11"
                    dur="1.2s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.2s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="19" cy="16" r="0.5" fill="#87CEEB" opacity="0">
                  <animate
                    attributeName="cy"
                    from="16"
                    to="13"
                    dur="1.5s"
                    begin="0.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.7"
                    to="0"
                    dur="1.5s"
                    begin="0.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
            {/* Torpedo tubes */}
            <circle cx="19" cy="13.5" r="0.3" fill="#333" />
            <circle cx="19" cy="14.5" r="0.3" fill="#333" />
          </svg>
        );
      case "ferry":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Hull */}
            <path
              d="M2 14C2 15.5 3 16.5 4 16.5H20C21 16.5 22 15.5 22 14V12H2V14Z"
              fill={color}
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Upper deck */}
            <rect
              x="4"
              y="8"
              width="16"
              height="4"
              fill="#E8E8E8"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Cabin structure */}
            <rect
              x="8"
              y="5"
              width="8"
              height="3"
              fill="white"
              stroke="#333"
              strokeWidth="0.5"
            />
            {/* Windows */}
            <rect
              x="6"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="8"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="10"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="12.5"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="14.5"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="16.5"
              y="9"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            {/* Bridge windows */}
            <rect
              x="9"
              y="5.5"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="11.25"
              y="5.5"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            <rect
              x="13.5"
              y="5.5"
              width="1.5"
              height="1"
              fill="#87CEEB"
              stroke="#333"
              strokeWidth="0.2"
            />
            {/* Smokestacks */}
            <rect x="10" y="3" width="1" height="2" fill="#666" />
            <rect x="13" y="2.5" width="1" height="2.5" fill="#666" />
            {/* Animated smoke */}
            {animate && (
              <g>
                <circle cx="10.5" cy="3" r="0" fill="#DDD" opacity="0">
                  <animate
                    attributeName="cy"
                    from="3"
                    to="-1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="13.5" cy="2.5" r="0" fill="#DDD" opacity="0">
                  <animate
                    attributeName="cy"
                    from="2.5"
                    to="-2"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    from="0"
                    to="1.8"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="2.5s"
                    begin="0.3s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
            {/* Car deck */}
            <rect
              x="5"
              y="10.5"
              width="14"
              height="1"
              fill="#333"
              opacity="0.3"
            />
            {/* Cars on deck */}
            <rect x="6" y="10.8" width="2" height="1" fill="#FF4444" />
            <rect x="9" y="10.8" width="2" height="1" fill="#4169E1" />
            <rect x="12" y="10.8" width="2" height="1" fill="#32CD32" />
            <rect x="15" y="10.8" width="2" height="1" fill="#FFD700" />
            {/* Water */}
            <path
              d="M0 17C4 16.5 8 17.5 12 17C16 16.5 20 17.5 24 17"
              stroke="#4169E1"
              strokeWidth="1"
              fill="none"
            />
            {/* Wake */}
            <path
              d="M22 15C20 14 18 16 16 15"
              stroke="#87CEEB"
              strokeWidth="0.5"
              fill="none"
              opacity="0.6"
            />
          </svg>
        );
      case "football":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Football shape with conditional animation */}
            <g>
              <ellipse
                cx="12"
                cy="12"
                rx="7"
                ry="4"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Laces */}
              <line
                x1="12"
                y1="8.5"
                x2="12"
                y2="15.5"
                stroke="white"
                strokeWidth="1"
              />
              <line
                x1="10.5"
                y1="10"
                x2="13.5"
                y2="10"
                stroke="white"
                strokeWidth="0.5"
              />
              <line
                x1="10.5"
                y1="11"
                x2="13.5"
                y2="11"
                stroke="white"
                strokeWidth="0.5"
              />
              <line
                x1="10.5"
                y1="12"
                x2="13.5"
                y2="12"
                stroke="white"
                strokeWidth="0.5"
              />
              <line
                x1="10.5"
                y1="13"
                x2="13.5"
                y2="13"
                stroke="white"
                strokeWidth="0.5"
              />
              <line
                x1="10.5"
                y1="14"
                x2="13.5"
                y2="14"
                stroke="white"
                strokeWidth="0.5"
              />
              {/* Side lines */}
              <path
                d="M5.5 10C7 9.5 9 9.8 10 10"
                stroke="#333"
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M5.5 14C7 14.5 9 14.2 10 14"
                stroke="#333"
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M18.5 10C17 9.5 15 9.8 14 10"
                stroke="#333"
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M18.5 14C17 14.5 15 14.2 14 14"
                stroke="#333"
                strokeWidth="0.5"
                fill="none"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion lines */}
            <path
              d="M20 8L22 7"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M21 10L23 9"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M20 16L22 17"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.5"
            />
          </svg>
        );
      case "basketball":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Ball body with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="8"
                fill={color}
                stroke="#333"
                strokeWidth="1"
              />
              {/* Curved lines pattern */}
              <path
                d="M4 12C8 8 16 8 20 12C16 16 8 16 4 12Z"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M12 4C8 8 8 16 12 20C16 16 16 8 12 4Z"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              {/* Additional curved details */}
              <path
                d="M6 7C9 9 15 9 18 7"
                fill="none"
                stroke="#333"
                strokeWidth="0.5"
              />
              <path
                d="M6 17C9 15 15 15 18 17"
                fill="none"
                stroke="#333"
                strokeWidth="0.5"
              />
              <path
                d="M7 6C9 9 9 15 7 18"
                fill="none"
                stroke="#333"
                strokeWidth="0.5"
              />
              <path
                d="M17 6C15 9 15 15 17 18"
                fill="none"
                stroke="#333"
                strokeWidth="0.5"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion blur */}
            <path
              d="M19 9C21 8 22 10 20 11"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
          </svg>
        );
      case "tennis":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Tennis ball body with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="7"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Characteristic curved lines */}
              <path
                d="M5.5 9C8 7 12 7 16 9C16 12 16 15 18.5 15"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M18.5 9C16 7 12 7 8 9C8 12 8 15 5.5 15"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              {/* Fuzzy texture lines */}
              <circle
                cx="12"
                cy="12"
                r="6.5"
                fill="none"
                stroke="#E8E8E8"
                strokeWidth="0.3"
                opacity="0.5"
              />
              <circle
                cx="12"
                cy="12"
                r="6"
                fill="none"
                stroke="#E8E8E8"
                strokeWidth="0.3"
                opacity="0.3"
              />
              <circle
                cx="12"
                cy="12"
                r="5.5"
                fill="none"
                stroke="#E8E8E8"
                strokeWidth="0.3"
                opacity="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion trail */}
            <ellipse cx="20" cy="12" rx="1" ry="3" fill={color} opacity="0.3" />
            <ellipse
              cx="21"
              cy="12"
              rx="0.5"
              ry="2"
              fill={color}
              opacity="0.2"
            />
          </svg>
        );
      case "volleyball":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Ball body with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="8"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Volleyball panel lines */}
              <path
                d="M4 12C8 6 16 6 20 12"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M4 12C8 18 16 18 20 12"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M12 4C6 8 6 16 12 20"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              <path
                d="M12 4C18 8 18 16 12 20"
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
              {/* Center line */}
              <path
                d="M4 12L20 12"
                fill="none"
                stroke="#333"
                strokeWidth="0.8"
              />
              <path
                d="M12 4L12 20"
                fill="none"
                stroke="#333"
                strokeWidth="0.8"
              />
              {/* Panel shading */}
              <path
                d="M4 12C8 6 12 4 12 12C8 18 4 12"
                fill="#E8E8E8"
                opacity="0.3"
              />
              <path
                d="M20 12C16 6 12 4 12 12C16 18 20 12"
                fill="#DDD"
                opacity="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1.3s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion lines */}
            <path
              d="M21 8C22 7 23 9 22 10"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M21 16C22 17 23 15 22 14"
              stroke="#333"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
          </svg>
        );
      case "baseball":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Ball body with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="8"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Stitching pattern */}
              <path
                d="M6 8C8 9 10 11 12 12C14 13 16 15 18 16"
                fill="none"
                stroke="#FF4444"
                strokeWidth="1.5"
              />
              <path
                d="M18 8C16 9 14 11 12 12C10 13 8 15 6 16"
                fill="none"
                stroke="#FF4444"
                strokeWidth="1.5"
              />
              {/* Stitch marks */}
              <path
                d="M7 8.5L6.5 9M8.5 9.5L8 10"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M9.5 10.5L9 11M10.5 11.5L10 12"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M13.5 12.5L14 12M14.5 13.5L15 13"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M15.5 14.5L16 14M16.5 15.5L17 15"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M17 8.5L17.5 9M15.5 9.5L16 10"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M14.5 10.5L15 11M13.5 11.5L14 12"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M10.5 12.5L10 12M9.5 13.5L9 13"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              <path
                d="M8.5 14.5L8 14M7.5 15.5L7 15"
                stroke="#FF4444"
                strokeWidth="0.8"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Ball texture */}
            <circle
              cx="12"
              cy="12"
              r="7.5"
              fill="none"
              stroke="#E8E8E8"
              strokeWidth="0.3"
              opacity="0.5"
            />
            {/* Motion effect */}
            <ellipse cx="21" cy="12" rx="0.8" ry="2" fill={color} opacity="0.3" />
          </svg>
        );
      case "golf":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Golf ball with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="16"
                r="3"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Dimple pattern on ball */}
              <circle cx="11" cy="15.5" r="0.15" fill="#DDD" />
              <circle cx="12.5" cy="15.2" r="0.15" fill="#DDD" />
              <circle cx="11.2" cy="16.8" r="0.15" fill="#DDD" />
              <circle cx="13" cy="16.5" r="0.15" fill="#DDD" />
              <circle cx="10.5" cy="16.2" r="0.15" fill="#DDD" />
              <circle cx="12.8" cy="17" r="0.15" fill="#DDD" />
              <circle cx="11.8" cy="17.2" r="0.15" fill="#DDD" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 16"
                  to="360 12 16"
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Golf club with conditional animation */}
            <g>
              <rect x="7.8" y="4" width="0.4" height="12" fill="#8B4513" />
              {/* Club head */}
              <rect
                x="6.5"
                y="14.5"
                width="3"
                height="1.5"
                fill="#C0C0C0"
                stroke="#333"
                strokeWidth="0.3"
              />
              {/* Grip */}
              <rect x="7.6" y="4" width="0.8" height="3" fill="#333" />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="-10 8 16"
                  to="20 8 16"
                  dur="1.5s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                  values="-10;20;-10"
                />
              )}
            </g>
            {/* Ball trajectory */}
            <path
              d="M12 16C14 12 16 8 18 6C19 5 20 6 19 7C17 9 15 13 12 16"
              stroke={color}
              strokeWidth="1"
              fill="none"
              strokeDasharray="2,2"
              opacity="0.6"
            />
            {/* Tee */}
            <rect x="11.7" y="18.5" width="0.6" height="1.5" fill="#FFE4B5" />
            <circle cx="12" cy="18.3" r="0.3" fill="#FFE4B5" />
            {/* Grass */}
            <path
              d="M8 20C10 19.5 14 19.5 16 20"
              stroke="#32CD32"
              strokeWidth="2"
            />
            <path
              d="M6 20.5C12 19.8 18 20.2 24 21"
              stroke="#228B22"
              strokeWidth="1.5"
            />
          </svg>
        );
      case "bowling":
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            {/* Bowling ball with conditional animation */}
            <g>
              <circle
                cx="12"
                cy="12"
                r="7"
                fill={color}
                stroke="#333"
                strokeWidth="0.5"
              />
              {/* Finger holes */}
              <circle cx="10" cy="9" r="0.8" fill="#333" />
              <circle cx="14" cy="9" r="0.8" fill="#333" />
              <circle cx="12" cy="11.5" r="0.9" fill="#333" />
              {/* Ball shine/highlight */}
              <ellipse cx="9" cy="8" rx="2" ry="3" fill="white" opacity="0.3" />
              {/* Ball shadow */}
              <ellipse
                cx="12"
                cy="18"
                rx="6"
                ry="1.5"
                fill="#333"
                opacity="0.3"
              />
              {animate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </g>
            {/* Motion blur */}
            <ellipse cx="20" cy="12" rx="1" ry="4" fill={color} opacity="0.3" />
            <ellipse
              cx="21"
              cy="12"
              rx="0.5"
              ry="3"
              fill={color}
              opacity="0.2"
            />
            {/* Lane markings/arrows */}
            <path
              d="M2 19L6 19M8 19L12 19M14 19L18 19M20 19L24 19"
              stroke="#8B4513"
              strokeWidth="0.5"
            />
            {/* Pins in distance */}
            <path
              d="M22 14L22 16"
              stroke="#F5F5DC"
              strokeWidth="0.8"
              opacity="0.7"
            />
            <path
              d="M21.5 14L21.5 16"
              stroke="#F5F5DC"
              strokeWidth="0.8"
              opacity="0.7"
            />
            <path
              d="M22.5 14L22.5 16"
              stroke="#F5F5DC"
              strokeWidth="0.8"
              opacity="0.7"
            />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" style={iconStyle}>
            <circle
              cx="12"
              cy="12"
              r="8"
              fill={color}
              stroke="#333"
              strokeWidth="2"
            />
          </svg>
        );
    }
  };

  return <div className="pointer-events-none">{getIcon()}</div>;
};