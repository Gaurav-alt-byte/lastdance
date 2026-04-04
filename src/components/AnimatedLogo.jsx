// import React from "react";

// // Replace this with your hosted image URL or import the PNG directly:
// import logoImg from "../assets/cracked-logo.png";
// const LOGO_URL = logoImg

// const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

// const AnimatedLogo = ({
//   variant = "full",
//   showLabel = false,
//   className = "",
//   labelClassName = "",
//   alt = "CrackedTube logo",
// }) => {
//   const isIcon = variant === "icon";
//   const size = isIcon ? 44 : 64;

//   return (
//     <div
//       className={joinClasses(
//         "cracked-logo",
//         isIcon ? "cracked-logo--icon" : "cracked-logo--full",
//         showLabel ? "cracked-logo--with-label" : "",
//         className,
//       )}
//       style={{ display: "flex", alignItems: "center", gap: showLabel ? "10px" : undefined }}
//     >
//       <span className="sr-only">{alt}</span>

//       <img
//         src={LOGO_URL}
//         alt=""
//         aria-hidden="true"
//         draggable="false"
//         style={{
//           width: `${size}px`,
//           height: `${size}px`,
//           objectFit: "contain",
//           objectPosition: "center",
//           flexShrink: 0,
//           // Subtle animation: gentle shake + glow pulse
//           animation: "ct-logo-shake 3.5s ease-in-out infinite",
//         }}
//       />

//       {showLabel ? (
//         <span
//           className={joinClasses(
//             "app-text-primary hidden text-xl font-bold tracking-tight sm:block",
//             labelClassName,
//           )}
//         >
//           CrackedTube
//         </span>
//       ) : null}

//       <style>{`
//         @keyframes ct-logo-shake {
//           0%, 100% { transform: translate(0, 0) rotate(0deg); filter: brightness(1); }
//           20%       { transform: translate(-0.6px, 0.5px) rotate(-0.4deg); filter: brightness(1.05); }
//           40%       { transform: translate(0.6px, -0.4px) rotate(0.4deg); filter: brightness(1); }
//           60%       { transform: translate(-0.4px, 0.6px) rotate(-0.3deg); filter: brightness(1.08); }
//           80%       { transform: translate(0.5px, -0.5px) rotate(0.3deg); filter: brightness(1); }
//           49%, 51%  { filter: brightness(1.25); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AnimatedLogo;


// import React from "react";
// import logoImg from "../assets/cracked-logo.png";

// const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

// const STYLES = `
//   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

//   @keyframes ct-bolt-drop {
//     0%,65%,100% { opacity: 0; transform: translateX(-50%) scaleY(0); }
//     67%         { opacity: 1; transform: translateX(-50%) scaleY(1.08); }
//     72%         { opacity: 1; transform: translateX(-50%) scaleY(0.96); }
//     80%         { opacity: 0.5; transform: translateX(-50%) scaleY(1); }
//     88%         { opacity: 0; }
//   }

//   @keyframes ct-text-zap {
//     0%,65%,100% { text-shadow: none; }
//     68%         { text-shadow: -2px 0 #ff3333, 2px 0 #ffffff88; }
//     72%         { text-shadow: 1px 0 #ff4444, -1px 0 #fff5; }
//     80%         { text-shadow: none; }
//   }

//   @keyframes ct-glow-burst {
//     0%,65%,100% { opacity: 0; }
//     68%,74%     { opacity: 0.4; }
//     84%         { opacity: 0; }
//   }

//   @keyframes ct-spark-l {
//     0%,65%,100% { opacity: 0; transform: translate(0,0) scale(0); }
//     70%         { opacity: 1; transform: translate(-9px, 4px) scale(1.1); }
//     80%         { opacity: 0; transform: translate(-15px, 9px) scale(0.3); }
//   }

//   @keyframes ct-spark-r {
//     0%,65%,100% { opacity: 0; transform: translate(0,0) scale(0); }
//     70%         { opacity: 1; transform: translate(9px, 4px) scale(1.1); }
//     80%         { opacity: 0; transform: translate(15px, 9px) scale(0.3); }
//   }

//   .ct-wordmark-wrap {
//     position: relative;
//     display: inline-flex;
//     align-items: center;
//   }

//   .ct-wordmark-glow {
//     position: absolute;
//     inset: -6px -12px;
//     background: radial-gradient(ellipse at 50% 60%, rgba(255,210,50,0.45) 0%, transparent 70%);
//     border-radius: 10px;
//     pointer-events: none;
//     animation: ct-glow-burst 3.5s ease-in-out infinite;
//     z-index: 0;
//   }

//   .ct-wordmark-bolt {
//     position: absolute;
//     top: -14px;
//     left: 50%;
//     transform-origin: top center;
//     animation: ct-bolt-drop 3.5s ease-in-out infinite;
//     z-index: 3;
//     pointer-events: none;
//   }

//   .ct-wordmark-text {
//     font-family: 'Bebas Neue', 'Impact', sans-serif;
//     font-weight: 400;
//     color: #ffffff;
//     letter-spacing: 0.06em;
//     text-transform: uppercase;
//     position: relative;
//     z-index: 2;
//     user-select: none;
//     white-space: nowrap;
//     animation: ct-text-zap 3.5s ease-in-out infinite;
//   }

//   .ct-spark-l {
//     position: absolute;
//     top: 50%;
//     left: 10%;
//     width: 7px;
//     height: 7px;
//     background: #ffe033;
//     clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
//     animation: ct-spark-l 3.5s ease-in-out infinite;
//     pointer-events: none;
//     z-index: 3;
//   }

//   .ct-spark-r {
//     position: absolute;
//     top: 50%;
//     right: 10%;
//     width: 7px;
//     height: 7px;
//     background: #ffe033;
//     clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
//     animation: ct-spark-r 3.5s ease-in-out infinite;
//     pointer-events: none;
//     z-index: 3;
//   }
// `;

// const BoltSVG = ({ width = 20, height = 48 }) => (
//   <svg width={width} height={height} viewBox="0 0 20 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M12 2L1 26H9L7 46L19 20H11L12 2Z"
//       fill="#ffdd00" opacity="0.3"
//       stroke="#ffcc00" strokeWidth="5"
//       strokeLinejoin="round" strokeLinecap="round"
//     />
//     <path
//       d="M12 2L1 26H9L7 46L19 20H11L12 2Z"
//       fill="#ffe033"
//       stroke="white" strokeWidth="0.8"
//       strokeLinejoin="round" strokeLinecap="round"
//     />
//   </svg>
// );

// const Wordmark = ({ fontSize = "1.75rem" }) => (
//   <div className="ct-wordmark-wrap">
//     <div className="ct-wordmark-glow" />
//     <div className="ct-spark-l" />
//     <div className="ct-spark-r" />
//     <div className="ct-wordmark-bolt">
//       <BoltSVG />
//     </div>
//     <span className="ct-wordmark-text" style={{ fontSize }}>
//       Cracked-Tube
//     </span>
//   </div>
// );

// const AnimatedLogo = ({
//   variant = "full",
//   showLabel = false,
//   className = "",
//   labelClassName = "",
//   alt = "CrackedTube logo",
// }) => {
//   const isIcon = variant === "icon";
//   const imgSize = isIcon ? 44 : 56;

//   return (
//     <>
//       <style>{STYLES}</style>
//       <div
//         className={joinClasses(
//           "cracked-logo",
//           isIcon ? "cracked-logo--icon" : "cracked-logo--full",
//           className,
//         )}
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           alignItems: "center",
//           gap: "12px",
//         }}
//       >
//         <span className="sr-only">{alt}</span>

//         {/* PNG logo — exactly as provided, no modifications */}
//         <img
//           src={logoImg}
//           alt=""
//           aria-hidden="true"
//           draggable="false"
//           style={{
//             width: `${imgSize}px`,
//             height: `${imgSize}px`,
//             objectFit: "contain",
//             flexShrink: 0,
//           }}
//         />

//         {/* Wordmark with thunderbolt — shown in full variant always, or in icon variant when showLabel=true */}
//         {(!isIcon || showLabel) && (
//           <Wordmark fontSize={isIcon ? "1.1rem" : "1.75rem"} />
//         )}
//       </div>
//     </>
//   );
// };

// export default AnimatedLogo;


import React from "react";
import logoImg from "../assets/cracked-logo.png";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

  @keyframes ct-letter-jump {
    0%,100% { transform: translateY(0) scaleX(1); }
    10%     { transform: translateY(-6px) scaleX(0.92); }
    20%     { transform: translateY(0px) scaleX(1.06); }
    28%     { transform: translateY(-3px) scaleX(0.97); }
    36%     { transform: translateY(0) scaleX(1); }
  }

  @keyframes ct-color-cycle {
    0%,100% { color: var(--ct-text); }
    5%      { color: #ff3a3a; }
    10%     { color: #ffe033; }
    15%     { color: var(--ct-text); }
    52%     { color: #ff6600; }
    54%     { color: var(--ct-text); }
  }

  @keyframes ct-bolt-drop {
    0%,60%,100% { opacity:0; transform:translateX(-50%) scaleY(0); }
    63%  { opacity:1; transform:translateX(-50%) scaleY(1.15); }
    68%  { opacity:1; transform:translateX(-50%) scaleY(0.9); }
    75%  { opacity:0.6; transform:translateX(-50%) scaleY(1); }
    85%  { opacity:0; }
  }

  @keyframes ct-glow {
    0%,55%,100% { opacity:0; }
    63%,72%     { opacity:0.55; }
    82%         { opacity:0; }
  }

  @keyframes ct-spark-l {
    0%,60%,100% { opacity:0; transform:translate(0,0) scale(0) rotate(0deg); }
    66%  { opacity:1; transform:translate(-10px,5px) scale(1.2) rotate(-20deg); }
    78%  { opacity:0; transform:translate(-18px,11px) scale(0.2) rotate(-45deg); }
  }

  @keyframes ct-spark-r {
    0%,60%,100% { opacity:0; transform:translate(0,0) scale(0) rotate(0deg); }
    66%  { opacity:1; transform:translate(10px,5px) scale(1.2) rotate(20deg); }
    78%  { opacity:0; transform:translate(18px,11px) scale(0.2) rotate(45deg); }
  }

  @keyframes ct-spark-top {
    0%,60%,100% { opacity:0; transform:translate(-50%,0) scale(0); }
    64%  { opacity:1; transform:translate(-50%,-14px) scale(1.1); }
    75%  { opacity:0; transform:translate(-50%,-22px) scale(0.3); }
  }

  @keyframes ct-underline-zap {
    0%,60%,100% { transform:scaleX(0); opacity:0; transform-origin:left; }
    62%  { transform:scaleX(1); opacity:1; transform-origin:left; }
    70%  { transform:scaleX(1); opacity:0.5; }
    76%  { transform:scaleX(0); opacity:0; transform-origin:right; }
  }

  @keyframes ct-charge {
    0%   { transform:scaleX(0); opacity:0; }
    60%  { transform:scaleX(1); opacity:1; }
    80%  { transform:scaleX(1); opacity:0.7; }
    100% { transform:scaleX(0); opacity:0; }
  }

  .ct-wordmark-outer {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    --ct-text: #111111;
    --ct-outline: rgba(255,255,255,0.55);
  }

  @media (prefers-color-scheme: dark) {
    .ct-wordmark-outer {
      --ct-text: #ffffff;
      --ct-outline: rgba(0,0,0,0.6);
    }
  }

  .dark .ct-wordmark-outer,
  [data-theme="dark"] .ct-wordmark-outer {
    --ct-text: #ffffff;
    --ct-outline: rgba(0,0,0,0.6);
  }

  .ct-glow-bg {
    position: absolute;
    inset: -8px -16px;
    background: radial-gradient(ellipse at 50% 55%, rgba(255,210,50,0.5) 0%, transparent 68%);
    border-radius: 12px;
    pointer-events: none;
    animation: ct-glow 3.5s ease-in-out infinite;
    z-index: 0;
  }

  .ct-wordmark-bolt {
    position: absolute;
    top: -16px;
    left: 50%;
    transform-origin: top center;
    animation: ct-bolt-drop 3.5s ease-in-out infinite;
    z-index: 4;
    pointer-events: none;
  }

  .ct-spark {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #ffe033;
    clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
    pointer-events: none;
    z-index: 4;
  }

  .ct-spark-l   { top:50%; left:8%;  animation: ct-spark-l   3.5s ease-in-out infinite; }
  .ct-spark-r   { top:50%; right:8%; animation: ct-spark-r   3.5s ease-in-out infinite; }
  .ct-spark-top { top:10%; left:50%; animation: ct-spark-top 3.5s ease-in-out infinite; }

  .ct-letters {
    display: flex;
    position: relative;
    z-index: 2;
    animation: ct-color-cycle 3.5s ease-in-out infinite;
  }

  .ct-letter {
    font-family: 'Bebas Neue', 'Impact', sans-serif;
    font-weight: 400;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: inherit;
    user-select: none;
    display: inline-block;
    animation: ct-letter-jump 3.5s ease-in-out infinite;
    text-shadow:
      -1px -1px 0 var(--ct-outline),
       1px -1px 0 var(--ct-outline),
      -1px  1px 0 var(--ct-outline),
       1px  1px 0 var(--ct-outline);
  }

  .ct-underline {
    height: 3px;
    width: 100%;
    background: #ffe033;
    border-radius: 2px;
    position: relative;
    z-index: 2;
    animation: ct-underline-zap 3.5s ease-in-out infinite;
    transform-origin: left;
    transform: scaleX(0);
  }

  .ct-charge-bar {
    position: absolute;
    bottom: -4px;
    left: 0; right: 0;
    height: 2px;
    background: #ff4400;
    transform-origin: left;
    animation: ct-charge 3.5s ease-in-out infinite;
    z-index: 2;
  }
`;

const BoltSVG = ({ width = 18, height = 44 }) => (
  <svg width={width} height={height} viewBox="0 0 18 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 2L1 24H8L6 42L17 18H10L11 2Z"
      fill="#ffdd00" opacity="0.3"
      stroke="#ffcc00" strokeWidth="4"
      strokeLinejoin="round" strokeLinecap="round"
    />
    <path
      d="M11 2L1 24H8L6 42L17 18H10L11 2Z"
      fill="#ffe033"
      stroke="white" strokeWidth="0.7"
      strokeLinejoin="round" strokeLinecap="round"
    />
  </svg>
);

const Wordmark = ({ fontSize = "2.4rem" }) => {
  const word = "CRACKED-TUBE";
  return (
    <div className="ct-wordmark-outer">
      <div className="ct-glow-bg" />
      <div className="ct-wordmark-bolt"><BoltSVG /></div>
      <div className="ct-spark ct-spark-l" />
      <div className="ct-spark ct-spark-r" />
      <div className="ct-spark ct-spark-top" />
      <div className="ct-letters">
        {word.split("").map((ch, i) => (
          <span
            key={i}
            className="ct-letter"
            style={{
              fontSize,
              animationDelay: `${(i * 0.045).toFixed(3)}s`,
              ...(ch === "-" ? { marginTop: "4px" } : {}),
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="ct-underline" />
      <div className="ct-charge-bar" />
    </div>
  );
};

const AnimatedLogo = ({
  variant = "full",
  showLabel = false,
  className = "",
  alt = "CrackedTube logo",
}) => {
  const isIcon = variant === "icon";
  const imgSize = isIcon ? 44 : 56;

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={joinClasses(
          "cracked-logo",
          isIcon ? "cracked-logo--icon" : "cracked-logo--full",
          className,
        )}
        style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}
      >
        <span className="sr-only">{alt}</span>

        {/* Original logo — plain img, no wrapper, no modifications */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          draggable="false"
          style={{
            width: `${imgSize}px`,
            height: `${imgSize}px`,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        {(!isIcon || showLabel) && (
          <Wordmark fontSize={isIcon ? "1.4rem" : "2.4rem"} />
        )}
      </div>
    </>
  );
};

export default AnimatedLogo;
