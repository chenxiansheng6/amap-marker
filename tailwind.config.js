/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'default': 'rgb(51, 51, 51)',
        'primary': 'rgb(5, 117, 249)',
        'header': 'rgb(71, 134, 249)',
        'secondary': 'rgb(102, 102, 102)',
        'disabled': 'rgb(180, 180, 180)',
        'placeholder': 'rgb(207, 207, 207)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180.00deg, rgb(71, 134, 249) 0%,rgb(71, 134, 249) 35.622%)',
        'gradient-secondary': 'linear-gradient(270.00deg, rgb(129, 194, 255) 0%,rgb(216, 229, 255) 71.5%)',
        'gradient-btn-primary': 'linear-gradient(270.00deg, rgb(4, 115, 249),rgb(29, 168, 255) 100%)',
        'gradient-btn-secondary': 'linear-gradient(270.00deg, rgb(249, 97, 4),rgb(255, 177, 29) 100%)',
        'gradient-sub': 'linear-gradient(180.00deg, rgba(248, 251, 255, 0),rgb(248, 251, 255) 100%)',
        'gradient-sub-p': 'linear-gradient(180.00deg, rgba(248, 251, 255, 0) 20.611%,rgb(248, 251, 255) 100%)',
        'gradient-btn-alarm': 'linear-gradient(270.00deg, rgb(226, 53, 53) 0.763%,rgb(255, 152, 80) 99.237%)',
        'gradient-btn-yellow': 'linear-gradient(270.00deg, #E39E07 0.763%,#F7E557 99.237%)',
        'gradient-btn-green': 'linear-gradient(270.00deg, #22B913 0.763%,#6AF274 99.237%)',
        'gradient-btn-gray': 'linear-gradient(270.00deg, #898989 0.763%,#B7B7B7 99.237%)',
      },
      opacity: {
        '15': 0.15,
      },
      width: {
        '86': '21.5rem',
        '90': '22.5rem',
      },
    },
  },
  plugins: [],
}

