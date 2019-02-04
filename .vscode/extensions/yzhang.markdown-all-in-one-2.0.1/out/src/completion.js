'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sizeOf = require("image-size");
const path = require("path");
const vscode_1 = require("vscode");
const util_1 = require("./util");
function activate(context) {
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(util_1.mdDocSelector, new MdCompletionItemProvider(), '(', '\\', '/'));
}
exports.activate = activate;
class MdCompletionItemProvider {
    constructor() {
        // Suffixes explained:
        // \cmd         -> 0
        // \cmd{$1}     -> 1
        // \cmd{$1}{$2} -> 2
        this.accents1 = ['grave', 'overleftarrow', 'overrightarrow', 'hat', 'underleftarrow', 'underrightarrow', 'widehat', 'overleftrightarrow', 'overbrace', 'acute', 'mathring', 'underleftrightarrow', 'underbrace', 'bar', 'tilde', 'overgroup', 'overlinesegment', 'breve', 'widetilde', 'undergroup', 'underlinesegment', 'check', 'vec', 'overleftharpoon', 'overrightharpoon', 'dot', 'overline', 'Overrightarrow', 'utilde', 'ddot', 'underline', 'widecheck'];
        this.delimiters0 = ['lgroup', 'rgroup', 'lceil', 'rceil', 'uparrow', 'lbrack', 'rbrack', 'lfloor', 'rfloor', 'downarrow', 'lbrace', 'rbrace', 'lmoustache', 'rmoustache', 'updownarrow', 'langle', 'rangle', 'lt', 'gt', 'Uparrow', 'vert', 'ulcorner', 'urcorner', 'Downarrow', 'Vert', 'llcorner', 'lrcorner', 'Updownarrow', 'lvert', 'rvert', 'lVert', 'rVert', 'left.', 'right.', 'backslash'];
        this.delimeterSizing0 = ['left', 'big', 'bigl', 'bigr', 'middle', 'Big', 'Bigl', 'Bigr', 'right', 'bigg', 'biggl', 'biggr', 'Bigg', 'Biggl', 'Biggr'];
        this.greekLetters0 = ['Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega', 'varGamma', 'varDelta', 'varTheta', 'varLambda', 'varXi', 'varPi', 'varSigma', 'varUpsilon', 'varPhi', 'varPsi', 'varOmega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'varepsilon', 'varkappa', 'vartheta', 'varpi', 'varrho', 'varsigma', 'varphi', 'digamma'];
        this.otherLetters0 = ['imath', 'eth', 'Im', 'text{\\aa}', 'text{\\o}', 'jmath', 'Finv', 'Re', 'text{\\AA}', 'text{\\O}', 'aleph', 'Game', 'wp', 'text{\\ae}', 'text{\\ss}', 'beth', 'ell', 'partial', 'text{\\AE}', 'text{\\i}', 'gimel', 'hbar', 'nabla', 'text{\\oe}', 'text{\\j}', 'daleth', 'hslash', 'Bbbk', 'text{\\OE}'];
        this.annotation1 = ['cancel', 'bcancel', 'xcancel', 'sout', 'overbrace', 'underbrace', 'boxed', 'not', 'tag', 'tag*'];
        this.overlap1 = ['mathllap', 'mathrlap', 'mathclap', 'llap', 'rlap', 'clap', 'smash'];
        this.verticalLayout0 = ['atop'];
        this.verticalLayout2 = ['stackrel', 'overset', 'underset', 'raisebox'];
        this.logicAndSetTheory0 = ['forall', 'complement', 'therefore', 'neg', 'lnot', 'exists', 'subset', 'because', 'emptyset', 'varnothing', 'nexists', 'supset', 'mapsto', 'in', 'mid', 'to', 'implies', 'notin', 'land', 'gets', 'impliedby', 'ni', 'lor', 'leftrightarrow', 'iff', 'notni'];
        this.bigOperators0 = ['sum', 'prod', 'bigvee', 'bigotimes', 'int', 'coprod', 'bigwedge', 'bigoplus', 'iint', 'intop', 'bigcap', 'bigodot', 'iiint', 'smallint', 'bigcup', 'biguplus', 'oint', 'bigsqcup'];
        this.binaryOperators0 = ['cdot', 'gtrdot', 'pmod', 'cdotp', 'intercal', 'pod', 'centerdot', 'land', 'rhd', 'circ', 'leftthreetimes', 'rightthreetimes', 'amalg', 'circledast', 'ldotp', 'rtimes', 'And', 'circledcirc', 'lor', 'setminus', 'ast', 'circleddash', 'lessdot', 'smallsetminus', 'barwedge', 'Cup', 'lhd', 'sqcap', 'bigcirc', 'cup', 'ltimes', 'sqcup', 'bmod', 'curlyvee', 'mod', 'times', 'boxdot', 'curlywedge', 'mp', 'unlhd', 'boxminus', 'div', 'odot', 'unrhd', 'boxplus', 'divideontimes', 'ominus', 'uplus', 'boxtimes', 'dotplus', 'oplus', 'vee', 'bullet', 'doublebarwedge', 'otimes', 'veebar', 'Cap', 'doublecap', 'oslash', 'wedge', 'cap', 'doublecup', 'pm', 'wr'];
        this.binomialCoefficients0 = ['choose'];
        this.binomialCoefficients2 = ['binom', 'dbinom', 'tbinom'];
        this.fractions0 = ['over'];
        this.fractions2 = ['frac', 'dfrac', 'tfrac', 'cfrac'];
        this.mathOperators0 = ['arcsin', 'cotg', 'ln', 'det', 'arccos', 'coth', 'log', 'gcd', 'arctan', 'csc', 'sec', 'inf', 'arctg', 'ctg', 'sin', 'lim', 'arcctg', 'cth', 'sinh', 'liminf', 'arg', 'deg', 'sh', 'limsup', 'ch', 'dim', 'tan', 'max', 'cos', 'exp', 'tanh', 'min', 'cosec', 'hom', 'tg', 'Pr', 'cosh', 'ker', 'th', 'sup', 'cot', 'lg', 'limits'];
        this.mathOperators1 = ['operatorname'];
        this.sqrt1 = ['sqrt'];
        this.relations0 = ['curlyeqsucc', 'gtrapprox', 'perp', 'succapprox', 'dashv', 'gtreqless', 'pitchfork', 'succcurlyeq', 'dblcolon', 'gtreqqless', 'prec', 'succeq', 'doteq', 'gtrless', 'precapprox', 'succsim', 'approx', 'Doteq', 'gtrsim', 'preccurlyeq', 'Supset', 'approxeq', 'doteqdot', 'in', 'preceq', 'supset', 'asymp', 'eqcirc', 'Join', 'precsim', 'supseteq', 'backepsilon', 'eqcolon', 'le', 'propto', 'supseteqq', 'backsim', 'Eqcolon', 'leq', 'risingdotseq', 'thickapprox', 'backsimeq', 'eqqcolon', 'leqq', 'shortmid', 'thicksim', 'between', 'Eqqcolon', 'leqslant', 'shortparallel', 'trianglelefteq', 'bowtie', 'eqsim', 'lessapprox', 'sim', 'triangleq', 'bumpeq', 'eqslantgtr', 'lesseqgtr', 'simeq', 'trianglerighteq', 'Bumpeq', 'eqslantless', 'lesseqqgtr', 'smallfrown', 'varpropto', 'circeq', 'equiv', 'lessgtr', 'smallsmile', 'vartriangle', 'colonapprox', 'fallingdotseq', 'lesssim', 'smile', 'vartriangleleft', 'Colonapprox', 'frown', 'll', 'sqsubset', 'vartriangleright', 'coloneq', 'ge', 'lll', 'sqsubseteq', 'vcentcolon', 'Coloneq', 'geq', 'llless', 'sqsupset', 'vdash', 'coloneqq', 'geqq', 'lt', 'sqsupseteq', 'vDash', 'Coloneqq', 'geqslant', 'mid', 'Subset', 'Vdash', 'colonsim', 'gg', 'models', 'subset', 'Vvdash', 'Colonsim', 'ggg', 'multimap', 'subseteq', 'cong', 'gggtr', 'owns', 'subseteqq', 'curlyeqprec', 'gt', 'parallel', 'succ'];
        this.negatedRelations0 = ['not', 'gnapprox', 'ngeqslant', 'nsubseteq', 'precneqq', 'gneq', 'ngtr', 'nsubseteqq', 'precnsim', 'gneqq', 'nleq', 'nsucc', 'subsetneq', 'gnsim', 'nleqq', 'nsucceq', 'subsetneqq', 'gvertneqq', 'nleqslant', 'nsupseteq', 'succnapprox', 'lnapprox', 'nless', 'nsupseteqq', 'succneqq', 'lneq', 'nmid', 'ntriangleleft', 'succnsim', 'lneqq', 'notin', 'ntrianglelefteq', 'supsetneq', 'lnsim', 'notni', 'ntriangleright', 'supsetneqq', 'lvertneqq', 'nparallel', 'ntrianglerighteq', 'varsubsetneq', 'ncong', 'nprec', 'nvdash', 'varsubsetneqq', 'ne', 'npreceq', 'nvDash', 'varsupsetneq', 'neq', 'nshortmid', 'nVDash', 'varsupsetneqq', 'ngeq', 'nshortparallel', 'nVdash', 'ngeqq', 'nsim', 'precnapprox'];
        this.arrows0 = ['circlearrowleft', 'Leftarrow ', 'looparrowright', 'rightrightarrows', 'circlearrowright', 'leftarrowtail', 'Lsh', 'rightsquigarrow', 'curvearrowleft', 'leftharpoondown', 'mapsto', 'Rrightarrow', 'curvearrowright', 'leftharpoonup', 'nearrow', 'Rsh', 'dashleftarrow', 'leftleftarrows', 'nleftarrow', 'searrow', 'dashrightarrow', 'leftrightarrow', 'nLeftarrow', 'swarrow', 'downarrow', 'Leftrightarrow', 'nleftrightarrow', 'to', 'Downarrow', 'leftrightarrows', 'nLeftrightarrow', 'twoheadleftarrow', 'downdownarrows', 'leftrightharpoons', 'nrightarrow', 'twoheadrightarrow', 'downharpoonleft', 'leftrightsquigarrow', 'nRightarrow', 'uparrow', 'downharpoonright', 'Lleftarrow', 'nwarrow', 'Uparrow', 'gets', 'longleftarrow', 'restriction', 'updownarrow', 'hookleftarrow', 'Longleftarrow', 'rightarrow', 'Updownarrow', 'hookrightarrow', 'longleftrightarrow', 'Rightarrow', 'upharpoonleft', 'iff', 'Longleftrightarrow', 'rightarrowtail', 'upharpoonright', 'impliedby', 'longmapsto', 'rightharpoondown', 'upuparrows', 'implies', 'longrightarrow', 'rightharpoonu', 'leadsto', 'Longrightarrow', 'rightleftarrows', 'leftarrow', 'looparrowleft', 'rightleftharpoons'];
        this.extensibleArrows1 = ['xrightarrow', 'xRightarrow', 'xrightharpoonup', 'xrightarrow', 'xmapsto', 'xrightharpoondown', 'xleftarrow', 'xLeftarrow', 'xleftharpoonup', 'xleftrightarrow', 'xLeftrightarrow', 'xleftharpoondown', 'xhookleftarrow', 'xhookrightarrow', 'xrightleftharpoons', 'xtwoheadrightarrow', 'xlongequal', 'xleftrightharpoons', 'xtwoheadleftarrow', 'xtofrom'];
        this.classAssignment0 = ['mathbin', 'mathclose', 'mathinner', 'mathop', 'mathopen', 'mathord', 'mathpunct', 'mathrel'];
        this.color2 = ['color', 'textcolor', 'colorbox'];
        this.font0 = ['rm', 'bf', 'it', 'sf', 'tt'];
        this.font1 = ['mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt', 'textrm', 'textbf', 'textit', 'textsf', 'texttt', 'textnormal', 'bold', 'Bbb', 'mathcal', 'frak', 'text', 'boldsymbol', 'mathbb', 'mathscr', 'mathfrak', 'bm'];
        this.size0 = ['Huge', 'huge', 'LARGE', 'Large', 'large', 'normalsize', 'small', 'footnotesize', 'scriptsize', 'tiny'];
        this.style0 = ['displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle', 'limits', 'nolimits', 'verb', 'text'];
        this.style1 = ['text'];
        this.symbolsAndPunctuation0 = ['Box', 'dots', 'checkmark', 'square', 'cdots', 'dag', 'blacksquare', 'ddots', 'dagger', 'triangle', 'ldots', 'textdagger', 'triangledown', 'vdots', 'ddag', 'textunderscore', 'triangleleft', 'mathellipsis', 'ddagger', 'triangleright', 'textellipsis', 'textdaggerdbl', 'textendash', 'bigtriangledown', 'flat', 'bigtriangleup', 'natural', 'textdollar', 'textemdash', 'blacktriangle', 'sharp', 'pounds', 'blacktriangledown', 'circledR', 'textsterling', 'textquoteleft', 'blacktriangleleft', 'circledS', 'yen', 'text{\\lq}', 'blacktriangleright', 'clubsuit', 'surd', 'textquoteright', 'diamond', 'diamondsuit', 'degree', 'text{\\rq}', 'Diamond', 'heartsuit', 'diagdown', 'textquotedblleft', 'lozenge', 'spadesuit', 'diagup', 'blacklozenge', 'angle', 'mho', 'textquotedblright', 'star', 'measuredangle', 'maltese', 'colon', 'bigstar', 'sphericalangle', 'text{\\P}', 'backprime', 'textbar', 'top', 'text{\\S}', 'prime', 'textbardbl', 'bot', 'nabla', 'textless', 'textbraceleft', 'textbraceright', 'infty', 'textgreater', 'KaTeX', 'LaTeX', 'TeX'];
        // \cmd
        let c1 = Array.from(new Set([...this.delimiters0, ...this.delimeterSizing0, ...this.greekLetters0, ...this.otherLetters0, ...this.verticalLayout0, ...this.logicAndSetTheory0, ...this.bigOperators0, ...this.binaryOperators0, ...this.binomialCoefficients0, ...this.fractions0, ...this.mathOperators0, ...this.relations0, ...this.negatedRelations0, ...this.arrows0, ...this.classAssignment0, ...this.font0, ...this.size0, ...this.style0, ...this.symbolsAndPunctuation0])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = cmd;
            return item;
        });
        // \cmd{$1}
        let c2 = Array.from(new Set([...this.accents1, ...this.annotation1, ...this.overlap1, ...this.mathOperators1, ...this.sqrt1, ...this.extensibleArrows1, ...this.font1, ...this.style1])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$1\}`);
            return item;
        });
        // \cmd{$1}{$2}
        let c3 = Array.from(new Set([...this.verticalLayout2, ...this.binomialCoefficients2, ...this.fractions2, ...this.color2])).map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$1\}\{$2\}`);
            return item;
        });
        let envSnippet = new vscode_1.CompletionItem('\\begin', vscode_1.CompletionItemKind.Snippet);
        envSnippet.insertText = new vscode_1.SnippetString('begin{${1|matrix,aligned,array,pmatrix,bmatrix,alignedat,vmatrix,Vmatrix,gathered,Bmatrix,cases|}}\n\t$2\n\\end{$1}');
        this.mathCompletions = [...c1, ...c2, ...c3, envSnippet];
    }
    provideCompletionItems(document, position, _token, _context) {
        const lineTextBefore = document.lineAt(position.line).text.substring(0, position.character);
        const lineTextAfter = document.lineAt(position.line).text.substring(position.character);
        let matches;
        matches = lineTextBefore.match(/\\+$/);
        if (/!\[[^\]]*?\]\([^\)]*$/.test(lineTextBefore)) {
            // Complete image paths
            if (vscode_1.workspace.getWorkspaceFolder(document.uri) === undefined)
                return [];
            matches = lineTextBefore.match(/!\[[^\]]*?\]\(([^\)]*?)[\\\/]?[^\\\/\)]*$/);
            let dir = matches[1].replace(/\\/g, '/');
            return vscode_1.workspace.findFiles((dir.length == 0 ? '' : dir + '/') + '**/*.{png,jpg,jpeg,svg,gif}', '**/node_modules/**').then(uris => uris.map(imgUri => {
                let relPath = path.relative(path.join(path.dirname(document.uri.fsPath), dir), imgUri.fsPath);
                relPath = relPath.replace(/\\/g, '/');
                let item = new vscode_1.CompletionItem(relPath.replace(/ /g, '&#32;'), vscode_1.CompletionItemKind.File);
                // Add image preview
                let dimensions;
                try {
                    dimensions = sizeOf(imgUri.fsPath);
                }
                catch (error) {
                    console.error(error);
                    return item;
                }
                const maxWidth = 318;
                if (dimensions.width > maxWidth) {
                    dimensions.height = Number(dimensions.height * maxWidth / dimensions.width);
                    dimensions.width = maxWidth;
                }
                item.documentation = new vscode_1.MarkdownString(`![${relPath}](${imgUri.fsPath.replace(/ /g, '&#32;')}|width=${dimensions.width},height=${dimensions.height})`);
                return item;
            }));
        }
        else if ((matches = lineTextBefore.match(/\\+$/)) !== null
            && matches[0].length % 2 !== 0) {
            if (/(^|[^\$])\$(|[^ \$].*)\\\w*$/.test(lineTextBefore)
                && lineTextAfter.includes('$')) {
                // Complete math functions (inline math)
                return this.mathCompletions;
            }
            else {
                const textBefore = document.getText(new vscode_1.Range(new vscode_1.Position(0, 0), position));
                const textAfter = document.getText().substr(document.offsetAt(position));
                if ((matches = textBefore.match(/\$\$/g)) !== null
                    && matches.length % 2 !== 0
                    && textAfter.includes('\$\$')) {
                    // Complete math functions ($$ ... $$)
                    return this.mathCompletions;
                }
                else {
                    return [];
                }
            }
        }
        else {
            return [];
        }
    }
}
//# sourceMappingURL=completion.js.map