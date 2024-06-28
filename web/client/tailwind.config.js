/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        Kanit: ["Kanit", "sans-serif"]
      },
      colors: {
        Navbar: {
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl(152,12%,99%)',
          },
          bg: {
            lightM: 'hsl(174,62%,49%)',
            darkM: 'hsl(174,62%,25%)',
          },
          hover: {
            lightM: 'hsl(174,62%,38%)',
            darkM: 'hsl(174,62%,20%)',
          },
          selected: {
            lightM: 'hsl(174,62%,30%)',
            darkM: 'hsl(174,62%,15%)',
          }
        },
        buttonPrimary: {
          bg: {
            lightM: 'hsl(174,62%,49%)',
            darkM: 'hsl(174,62%,25%)',
          },
          hover: {
            lightM: 'hsl(174,62%,38%)',
            darkM: 'hsl(174,62%,20%)',
          },
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl(152,12%,99%)',
          },
          selected: {
            lightM: 'hsl()',
            darkM: 'hsl()',
          }
        },
        buttonSecondary: {
          bg: {
            lightM: 'hsl(360, 100%, 100%)',
            darkM: 'hsl(216,29%,24%)',
          },
          hover: {
            lightM: 'hsl(220,13%,91%)',
            darkM: 'hsl()',
          },//active: use ring instead of deeper color
          text: {
            lightM: 'hsl(174,62%,49%)',
            darkM: 'hsl()',
          },
          border: {
            lightM: 'hsl(174,62%,49%)',
            darkM: 'hsl(360,100%,100%)',
          },
        },
        optionIcon: {
          bg: {
            lightM: 'hsl(360,100%,100%)',
            darkM: 'hsl(216,29%,34%)',
          },
          hover: {
            lightM: 'hsl(0,0%,92%)',
            darkM: 'hsl(216,29%,30%)',
          },
          active: {
            lightM: 'hsl(0,0%,84%)',
            darkM: 'hsl(216,29%,26%)',
          },
          fg: {
            lightM: 'hsl(205,3%,45%)',
            darkM: 'hsl(205,3%,65%)',
          },
        },
        optionCard: {
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl(184,7%,96%)',
          },
          bg: {
            lightM: 'hsl(360,100%,100%)',
            darkM: 'hsl(216,29%,34%)',
          },
          border: {
            lightM: 'hsl(218,75%,80%)',
            darkM: 'hsl(216,4%,29%)',
          },
        },
        options: {
          hover: {
            lightM: 'hsl(0,0%,92%)',
            darkM: 'hsl(216,29%,30%)',
          },
          active: {
            lightM: 'hsl(0,0%,84%)',
            darkM: 'hsl(216,29%,26%)',
          },
        },
        card: {
          bg: {
            lightM: 'hsl(360,100%,100%)',
            darkM: 'hsl(216,29%,24%)',
          },
          hover: {
            lightM: 'hsl(360,7%,92%)',
            darkM: 'hsl(216,29%,16%)',
          },
          active: {
            lightM: 'hsl(360,7%,84%)',
            darkM: 'hsl(216,29%,8%)',
          },
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl(184,7%,96%)',
          },
          subtext: {
            lightM: 'hsl(0,0%,30%)',
            darkM: 'hsl(184,7%,70%)',
          },
          border: {
            lightM: 'hsl(218,75%,80%)',
            darkM: 'hsl(216,4%,29%)',
          },
        },
        editor: {
          bg: {
            lightM: 'hsl(216,12%,96%)',
            darkM: 'hsl(221,8%,70%)',
          },
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl()',
          },
        },
        body: {
          bg: {
            lightM: 'hsl(33,100%,91%)',
            darkM: 'hsl(220,31%,32%)',
          },
          text: {
            lightM: 'hsl(0,0%,0%)',
            darkM: 'hsl(0,100%,100%)',
          },
        },
      }
    },
  },
  plugins: [],
}