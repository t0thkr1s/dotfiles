#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip python3-pip neofetch vlc transmision-gtk wget nikto nmap i3
	thunar firefox ranger adapta-gtk-theme lxappearance arp-scan
	papirus-icon-theme openjdk-11-jdk neovim fortune snapd
	sqlitebrowser terminator htop wireshark lolcat toilet cowsay git
	bleachbit timeshift tor tlp preload autoconf gdb gparted
	hashcat zsh trash-cli)

add-apt-repository ppa:tista/adapta
add-apt-repository ppa:papirus/papirus

# Update and upgrade
apt update && apt full-upgrade -y

# Installing packages
for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null
	echo "[ done ] $package installed!"
done

# Downloading and installing gotop
echo "[ info ] Downloading gotop..."
git clone --depth 1 https://github.com/cjbassi/gotop /tmp/gotop
/tmp/gotop/scripts/download.sh
cp gotop /usr/bin/
echo "[ done ] gotop is ready to use!"

# Downloading Burp suite commmunity edition
echo "[ info ] Downloading Burp Suite Community Edition..."
wget -O /tmp/burpsuite.sh "https://portswigger.net/burp/releases/download?product=community&type=linux"
echo "[ done ]Burp Suite downloaded!"

# Start Burp Suite installer
chmod +x /tmp/burpsuite.sh
/tmp/burpsuite.sh

# Install Spotify, Discord, Sublime Text, Postman via Snap
snap install spotify
snap install discord
snap install atom
snap install postman

# Adding non-root user to th wireshark group
usermod -aG wireshark $USER

# Start tlp
tlp start

# Install Plug for Neovim
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

# Copies directories into .config directory
cp -fR neofetch deluge vis htop terminator i3 polybar nvim ranger rofi dunst $HOME/.config
cp compton.conf $HOME/.config
# Replaces the .bashrc file
cp -f .bashrc $HOME
# Replaces the .zshrc file
cp -f .zshrc $HOME
# Replaces .gitconfig
cp -f .gitconfig $HOME

# Cleaning up
trash /tmp/gotop
trash /tmp/burpsuite.sh
apt autoremove
apt autoclean
