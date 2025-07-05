# Steam Barrel

This is an Electron application for macOS that allows you to run Windows-only Steam games using Wine.

## Features

- Run Windows-only Steam games on macOS.
- Simple and easy-to-use interface.
- Powered by Electron and Wine.

## Installation and Setup

0.  **Install Homebrew (if not already installed):**
    Homebrew is a package manager for macOS that simplifies the installation of software. If you don't have it installed, open your Terminal and run:

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

1.  **Install Node.js and npm:**
    If you don't have Node.js and npm installed, you can install them using Homebrew:

    ```bash
    brew install node
    ```

    Alternatively, you can download the installer from the official Node.js website: [https://nodejs.org/](https://nodejs.org/)

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/jmazaia/steam-barrel.git
    ```
3.  **Navigate to the project directory:**
    ```bash
    cd steam-macos
    ```
4.  **Install dependencies:**
    ```bash
    npm install
    ```
5.  **Run the application:**
    ```bash
    npm start
    ```

## Usage

1.  Launch the application.
2.  Log in to your Steam account.
3.  Install and run your favorite Windows-only Steam games.

## Common Errors and Troubleshooting

- **"Wine is not installed" error:**
  - This error occurs when Wine is not installed on your system. To fix this, you can install Wine using Homebrew:
    ```bash
    brew install --cask wine-stable
    ```
- **"Electron failed to install" error:**
  - This error can occur due to network issues or incorrect permissions. Try the following solutions:
    - Check your internet connection.
    - Run `npm install` with sudo: `sudo npm install`
    - Clear the npm cache: `npm cache clean --force`
- **Graphics issues or errors related to DirectX/DXVK:**
  - If you experience graphical glitches, crashes, or error messages mentioning "DXVK" or "DirectX", you may need to install DXVK manually. Please follow the instructions in the "Manual DXVK Installation" section.

## Manual DXVK Installation

If you encounter issues with graphics or performance, you may need to install or reinstall DXVK manually.

1.  **Set the necessary environment variables:**

    ```bash
    export WINE_PREFIX="$HOME/.steam-wine"
    export DXVK_VERSION="2.3"
    ```

2.  **Download the DXVK release:**

    ```bash
    curl -L "https://github.com/doitsujin/dxvk/releases/download/v${DXVK_VERSION}/dxvk-${DXVK_VERSION}.tar.gz" -o /tmp/dxvk.tar.gz
    ```

3.  **Extract the archive:**

    ```bash
    tar -xzf /tmp/dxvk.tar.gz -C /tmp
    ```

4.  **Navigate into the extracted directory and run the setup script:**
    ```bash
    cd /tmp/dxvk-${DXVK_VERSION} && ./setup_dxvk.sh install
    ```

## Future Interface Improvements

- **Modern and intuitive design:**
  - Implement a more modern and visually appealing design using a popular CSS framework like Bootstrap or Tailwind CSS.
- **Game-specific configurations:**
  - Allow users to create and save custom configurations for each game.
- **Improved game library:**
  - Add features like searching, sorting, and filtering to the game library.
- **Seamless integration with macOS:**
  - Implement features like native notifications and drag-and-drop support.

## Support

If you find this project helpful, consider supporting its development. For questions or support, you can reach me on Discord: `mazaiaa`.

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=jonathan_mazaia@outlook.com&item_name=Supporting+the+development+of+Steam+macOS)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
