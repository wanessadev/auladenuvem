# Visão Geral do Projeto: Jogo Breakout

Este documento descreve o projeto de um jogo clássico de Breakout (Quebra-Tijolos) desenvolvido em HTML, CSS e JavaScript, com uma estética retro-futurista (Synthwave) inspirada nos anos 80.

## Funcionalidades e Estilo

*   **HTML:** A estrutura base do jogo.
*   **CSS:** Estilização com uma paleta de cores de néon e tipografia de arcade.
*   **JavaScript:** Toda a lógica do jogo, incluindo:
    *   **Sistema de Níveis:** Duas fases com dificuldade e design crescentes.
    *   **Renderização de Objetos:**
        *   **Nível 1:** Tijolos retangulares clássicos.
        *   **Nível 2:** Tijolos em forma de coração com brilho de néon.
    *   **Animação de Partículas:** Uma "explosão" visual ocorre quando um tijolo é destruído.
    *   **Sistema de Power-ups:** Itens que caem aleatoriamente e concedem habilidades especiais:
        *   **Raquete Larga ('W'):** Aumenta temporariamente o tamanho da raquete.
        *   **Multi-bola ('M'):** Adiciona mais duas bolas ao jogo.
        *   **Bola de Fogo ('F'):** Transforma a bola numa bola de fogo que destrói tijolos sem ricochetear.
        *   **Vida Extra ('+'):** Concede uma vida adicional.
    *   Efeito de rasto (trail) de néon na bola.
    *   Movimentação da raquete através do rato e do teclado.
    *   Efeitos sonoros retro.
    *   Detecção de colisão e gestão de estado (pontuação, vidas, etc.).

## Plano de Implementação Atual

1.  **Refatorar para Multi-bola (JavaScript):**
    *   Modificar a lógica principal de uma única bola (`x, y, dx, dy`) para um array de objetos de bola (`balls`).
    *   Atualizar o ciclo do jogo (`draw`) para iterar sobre todas as bolas para movimento, desenho e colisão.
    *   Ajustar a condição de perda de vida: só ocorre quando a última bola sai do ecrã.
2.  **Expandir Sistema de Power-ups (JavaScript):**
    *   Fazer com que a função `createPowerUp` escolha aleatoriamente entre os quatro tipos de power-ups disponíveis.
    *   Criar uma função `activatePowerUp(type)` para aplicar o efeito correspondente.
    *   Implementar a lógica para os novos power-ups:
        *   **Multi-bola:** Adicionar duas novas bolas ao array `balls`.
        *   **Bola de Fogo:** Adicionar um estado `isFireball` às bolas e um temporizador para o remover. A colisão deve ser modificada para não ricochetear neste estado.
        *   **Vida Extra:** Incrementar a variável `lives`.
