#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

script_dir="$(dirname "$(realpath $0)")"

packages=(python-pip python3-pip neofetch vlc transmision-gtk wget nikto nmap i3 virtualbox-6.0
	thunar firefox ranger adapta-gtk-theme lxappearance arp-scan libxml2-utils inkscape
	curl default-jdk default-jre neovim fortune snapd feh xxd dirb libglib2.0-dev virtualbox-ext-pack
	sqlitebrowser terminator htop wireshark lolcat toilet cowsay git libgdk-pixbuf2.0-dev
	bleachbit timeshift tor tlp preload automake autoconf gdb gparted openvpn atom
	hashcat zsh trash-cli binwalk stegosuite parallel sassc pkg-config)

# Delete previous adapta installation
rm -rf /usr/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
rm -rf ~/.local/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
rm -rf ~/.themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}

apt update && apt full-upgrade -y

# Installing packages
for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null
	echo "[ done ] $package installed!"
done

# Download and install Papirus icon theme
wget -qO- "https://raw.githubusercontent.com/PapirusDevelopmentTeam/papirus-icon-theme/master/install.sh" | DESTDIR="$HOME/.icons" sh

# Download specific Adapta theme release
wget "https://github.com/adapta-project/adapta-gtk-theme/archive/3.95.0.1.zip" -O /tmp/adapta.zip
# Extract the files
unzip /tmp/adapta.zip -d adapta
# Change directory and install the theme
cd /tmp/adapta/adapta-gtk-theme-3.95.0.1/ && ./autogen.sh --prefix=/usr && make && make install

# Install Breeze-Adapta cursor theme
rm -rf /usr/share/icons/Breeze-Adapta
mkdir /usr/share/icons/Breeze-Adapta
cp -R ${script_dir}/cursors/Breeze-Adapta/* /usr/share/icons/Breeze-Adapta

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
echo "[ info ] Starting installer..."
chmod +x /tmp/burpsuite.sh
/tmp/burpsuite.sh
echo "[ done ] Burp Suite installed!"

# Installing searchsploit
git clone https://github.com/offensive-security/exploitdb.git /opt/exploitdb
sed 's|path_array+=(.*)|path_array+=("/opt/exploitdb")|g' /opt/exploitdb/.searchsploit_rc > ~/.searchsploit_rc
ln -sf /opt/exploitdb/searchsploit /usr/local/bin/searchsploit

# Install Spotify and Postman via Snap
snap install spotify
snap install postman

# Adding non-root user to th wireshark group
usermod -aG wireshark $USER

# Start tlp
tlp start

# Install Plug for Neovim
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

# Copies directories into .config directory
cp -fR neofetch transmission vis vlc htop terminator i3 polybar nvim ranger rofi dunst $HOME/.config
cp compton.conf $HOME/.config
cp -f .bashrc $HOME
cp -f .zshrc $HOME
cp -f .gitconfig $HOME

# Cleaning up
rm /tmp/gotop /tmp/burpsuite
rm -rf $0
apt autoremove
apt autoclean
