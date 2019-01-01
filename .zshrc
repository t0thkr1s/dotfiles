source ~/.config/antigen.zsh

antigen use oh-my-zsh

# bundles from the default repo
antigen bundle git
antigen bundle pip

# bundles
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle wbingli/zsh-wakatime

# themes
antigen theme robbyrussell
# antigen theme denysdovhan/spaceship-prompt

antigen apply
