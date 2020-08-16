#!/usr/bin/env bash

echo "Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

echo "Installing Brew Cask..."
brew tap caskroom/cask

echo "Installing Applications..."
brew install git
brew install docker
brew install wget
brew install neofetch
brew install apktool
brew install aircrack-ng
brew install binwalk
brew install arp-scan
brew install exiftool
brew install ffuf
brew install foremost
brew install go
brew install imagemagic
brew install john
brew install neovim
brew install nikto
brew install wpscan
brew install nmap
brew install netcat
brew install sqlmap
brew install termshark


brew cask install java
brew cask install firefox
brew cask install wireshark
brew cask install iterm2
brew cask install owasp-zap
brew cask install burp-suite
brew cask install ghidra
brew cask install cutter
brew cask install tunnelblick
brew cask install transmission
brew cask install visual-studio-code
brew cask install sublime-text
brew cask install tor-browser
brew cask install signal
brew cask install virtualbox
brew cask install veracrypt
brew cask install osxfuse
brew cask install spotify
brew cask install iina
brew cask install handbrake
brew cask install balenaetcher
brew cask install android-studio
brew cask install font-jetbrains-mono
brew cask install openinterminal

echo "Done!"
