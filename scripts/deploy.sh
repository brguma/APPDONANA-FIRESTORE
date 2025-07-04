#!/bin/bash

# 🚀 APP DONANA - Deploy Script
# Automatiza o deploy para GitHub Pages

set -e  # Para execução em caso de erro

echo "🧁 APP DONANA - Deploy Starting..."
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado! Execute este script na raiz do projeto."
    exit 1
fi

log_info "Verificando projeto..."

# 2. Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado!"
    echo "Por favor, configure suas variáveis de ambiente primeiro."
    echo "Copie .env.example para .env e preencha os valores."
    exit 1
fi

log_success "Variáveis de ambiente encontradas"

# 3. Verificar dependências
log_info "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências..."
    npm install
fi

log_success "Dependências verificadas"

# 4. Executar testes (se existirem)
log_info "Executando testes..."
if npm test -- --passWithNoTests --watchAll=false; then
    log_success "Testes passaram"
else
    log_error "Testes falharam! Deploy cancelado."
    exit 1
fi

# 5. Verificar lint (se configurado)
log_info "Verificando código..."
if command -v eslint &> /dev/null; then
    if npm run lint --if-present; then
        log_success "Lint passou"
    else
        log_warning "Problemas de lint encontrados, mas continuando..."
    fi
fi

# 6. Criar build de produção
log_info "Criando build de produção..."
if npm run build; then
    log_success "Build criado com sucesso"
else
    log_error "Falha na criação do build!"
    exit 1
fi

# 7. Verificar se gh-pages está instalado
if ! npm list gh-pages &> /dev/null; then
    log_info "Instalando gh-pages..."
    npm install --save-dev gh-pages
fi

# 8. Verificar configuração do GitHub
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    log_error "Repositório Git não configurado!"
    echo "Configure o repositório remoto primeiro:"
    echo "git remote add origin https://github.com/SEU_USUARIO/app-donana-firebase.git"
    exit 1
fi

log_info "Repositório: $REPO_URL"

# 9. Verificar se o homepage está configurado no package.json
HOMEPAGE=$(node -p "require('./package.json').homepage" 2>/dev/null || echo "")
if [ -z "$HOMEPAGE" ]; then
    log_warning "Homepage não configurado no package.json"
    echo "Adicione esta linha ao seu package.json:"
    echo '"homepage": "https://SEU_USUARIO.github.io/app-donana-firebase"'
    read -p "Deseja continuar mesmo assim? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Deploy cancelado pelo usuário"
        exit 0
    fi
else
    log_success "Homepage configurado: $HOMEPAGE"
fi

# 10. Confirmar deploy
echo ""
log_warning "🚀 PRONTO PARA DEPLOY!"
echo "Isso irá:"
echo "  • Fazer deploy do build para GitHub Pages"
echo "  • Sobrescrever a branch gh-pages"
echo "  • Tornar o app público em: $HOMEPAGE"
echo ""
read -p "Confirma o deploy? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    log_info "Deploy cancelado pelo usuário"
    exit 0
fi

# 11. Executar deploy
log_info "Fazendo deploy para GitHub Pages..."
if npm run deploy; then
    log_success "Deploy concluído com sucesso! 🎉"
    echo ""
    echo "🌐 Seu app estará disponível em:"
    echo "   $HOMEPAGE"
    echo ""
    echo "⏰ Pode levar alguns minutos para ficar online."
    echo ""
    echo "🔧 Para verificar o status:"
    echo "   GitHub → Settings → Pages"
else
    log_error "Falha no deploy!"
    echo ""
    echo "Possíveis soluções:"
    echo "1. Verifique suas credenciais do GitHub"
    echo "2. Certifique-se que o repositório existe"
    echo "3. Verifique se tem permissões de escrita"
    echo "4. Execute: git push origin main"
    exit 1
fi

# 12. Opcional: Abrir o site
if command -v open &> /dev/null; then
    read -p "Deseja abrir o site no navegador? (y/N): " open_browser
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        open "$HOMEPAGE"
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "Deseja abrir o site no navegador? (y/N): " open_browser
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        xdg-open "$HOMEPAGE"
    fi
fi

echo ""
log_success "🧁 APP DONANA deploy concluído!"
echo "======================================"

# 13. Limpeza (opcional)
read -p "Deseja limpar arquivos temporários? (y/N): " cleanup
if [ "$cleanup" = "y" ] || [ "$cleanup" = "Y" ]; then
    log_info "Limpando arquivos temporários..."
    rm -rf build/.cache 2>/dev/null || true
    log_success "Limpeza concluída"
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Aguarde alguns minutos para o site ficar online"
echo "2. Configure um domínio personalizado (opcional)"
echo "3. Configure GitHub Actions para deploy automático"
echo "4. Monitore o Firebase Console para uso"
echo ""
echo "📚 Documentação: https://github.com/SEU_USUARIO/app-donana-firebase"
echo ""
echo "🚀 Happy coding!"