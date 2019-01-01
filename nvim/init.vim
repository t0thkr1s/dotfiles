set number
set nowrap
set mouse=a

call plug#begin('~/.vim/plugged')

Plug 'junegunn/vim-easy-align'

Plug 'scrooloose/nerdtree', { 'on':  'NERDTreeToggle' }
Plug 'tpope/vim-fireplace', { 'for': 'clojure' }

Plug 'nsf/gocode', { 'tag': 'v.20150303', 'rtp': 'vim' }

Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }

" Enable deoplete at startup
let g:deoplete#enable_at_startup = 1

" Python language support
Plug 'zchee/deoplete-jedi'

" Airline statusline
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" Gitgutter plugin
Plug 'airblade/vim-gitgutter'

" Wakatime support
Plug 'wakatime/vim-wakatime'

" Initialize plugin system
call plug#end()

set wildmenu

set laststatus=2
set statusline=
set statusline+=%2*\ %l
set statusline+=\ %*
set statusline+=%1*\ ‹‹
set statusline+=%1*\ %f\ %*
set statusline+=%1*\ ››
set statusline+=%=
set statusline+=%1*\ %m
set statusline+=%3*\ %F
set statusline+=\ %*
