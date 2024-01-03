export function Logo() {
  return (
    <h1 class="Title">
      <svg viewBox="0 -18 125 22">
        <defs>
          <linearGradient id="rainbow" x1="0" x2="100%" y1="0" y2="100%" gradientUnits="userSpaceOnUse" >
            <stop stop-color="#01386a" offset="0%"/> 
            <stop stop-color="#66FFB3" offset="100%"/>
          </linearGradient>
        </defs>
          <text fill="url(#rainbow)" x="-1%">HippoTable</text>
      </svg>
      View and analyze data in your browser
    </h1>
  );
}
