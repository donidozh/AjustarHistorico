// ==UserScript==
// @name         Otimizador de Histórico SIGEDUCA
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Otimiza o tamanho do histórico Ensino Médio no Sigeduca.
// @author       Elder Martins
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwgedteladocumento.aspx?0,36
// @downloadURL  https://raw.githubusercontent.com/donidozh/OtimizadorHistorico/main/OtimizadorHistorico.user.js
// @updateURL    https://raw.githubusercontent.com/donidozh/OtimizadorHistorico/main/OtimizadorHistorico.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Definição das constantes de texto com quebras de linha
    const AREAS = {
        MAT: "MATEMÁTICA E<br>SUAS TECNOLOGIAS",
        HUM: "CIÊNCIAS HUMANAS E<br>SOCIAIS APLICADAS",
        LIN: "LINGUAGENS E<br>SUAS TECNOLOGIAS",
        NAT: "CIÊNCIAS DA NATUREZA E<br>SUAS TECNOLOGIAS",
        PV:  "PROJETO DE VIDA",
        ELE: "ELETIVAS",
        ITI: "ITINERÁRIO FORMATIVO",
        AP_ESTUDOS: "APROFUNDAMENTO<br>DE ESTUDOS",
        T_HUM_CHSA: "TRILHA DE APROFUNDAMENTO DE<br>CIÊNCIAS HUMANAS E<br>SOCIAIS APLICADAS (CHSA)",
        T_NAT_CNT: "TRILHA DE APROFUNDAMENTO DE<br>CIÊNCIAS DA NATUREZA E<br>SUAS TECNOLOGIAS (CNT)",
        T_LIN_LGG: "TRILHA DE APROFUNDAMENTO DE<br>LINGUAGENS E<br>SUAS TECNOLOGIAS (LGG)"
    };

    // Estilo para ocultar o botão na impressão
    const style = document.createElement('style');
    style.innerHTML = `@media print { .btn-otimizar-elder { display: none !important; } }`;
    document.head.appendChild(style);

    function criarSpan(textoHtml) {
        const span = document.createElement('span');
        // Estilo centralizado, 65% opacidade conforme versões anteriores
        span.style.cssText = `
            font-size: 10px;
            font-weight: bold;
            display: inline-block;
            line-height: 1.1;
            text-align: center;
            width: 100%;
            opacity: 0.65;
        `;
        span.innerHTML = textoHtml;
        return span;
    }

    function processarDocumento() {
        const celulas = document.querySelectorAll('td');
        let contador = 0;

        celulas.forEach(celula => {
            const texto = celula.innerText.toUpperCase().trim();
            if (texto === "") return;

            let areaHtml = "";

            // 1. PRIORIDADE: APROFUNDAMENTO –
            if (texto.startsWith("APROFUNDAMENTO –") || texto.startsWith("APROFUNDAMENTO -")) {
                areaHtml = AREAS.AP_ESTUDOS;
            }

            // 2. Regras IF/TA (Trilhas)
            else if (["SOCIOLOGIA IF/TA", "HISTÓRIA IF/TA", "GEOGRAFIA IF/TA", "FILOSOFIA IF/TA"].includes(texto)) {
                areaHtml = AREAS.T_HUM_CHSA;
            }
            else if (["BIOLOGIA IF/TA", "FÍSICA IF/TA", "QUÍMICA IF/TA"].includes(texto)) {
                areaHtml = AREAS.T_NAT_CNT;
            }
            else if (["L.ESTRANGEIRA IF/TA", "L.ESTRANG (INGLÊS) IF/TA", "LINGUA INGLESA IF/TA", "ARTE IF/TA"].includes(texto)) {
                areaHtml = AREAS.T_LIN_LGG; // Adicionado ARTE IF/TA aqui
            }
            else if (texto === "PROJETO DE VIDA IF/TA") {
                areaHtml = AREAS.ITI;
            }

            // 3. Base Comum
            else if (texto === "MATEMÁTICA") areaHtml = AREAS.MAT;
            else if (["HISTÓRIA", "GEOGRAFIA", "SOCIOLOGIA", "FILOSOFIA"].includes(texto)) areaHtml = AREAS.HUM;
            else if (["ARTE", "EDUCAÇÃO FÍSICA", "LINGUA PORTUGUESA", "L.ESTRANG (INGLÊS)", "LÍNGUA INGLESA"].includes(texto)) areaHtml = AREAS.LIN;
            else if (["BIOLOGIA", "FÍSICA", "QUÍMICA"].includes(texto)) areaHtml = AREAS.NAT;
            else if (texto.includes("ELETIVA")) areaHtml = AREAS.ELE;
            else if (texto === "PROJETO DE VIDA") areaHtml = AREAS.PV;

            // AÇÃO: Alterar célula à esquerda (Coluna da Área)
            if (areaHtml !== "") {
                const celulaArea = celula.previousElementSibling;
                if (celulaArea) {
                    celulaArea.innerHTML = "";
                    celulaArea.style.verticalAlign = "middle";
                    celulaArea.style.textAlign = "center";
                    celulaArea.appendChild(criarSpan(areaHtml));
                    contador++;
                }
            }
        });

        const btn = document.querySelector('.btn-otimizar-elder');
        btn.innerText = `✓ ${contador} Áreas Otimizadas`;
        btn.style.background = "#6c757d";
    }

    function criarBotao() {
        if (document.querySelector('.btn-otimizar-elder')) return;
        const btn = document.createElement('button');
        btn.className = 'btn-otimizar-elder';
        btn.innerText = 'Otimizar Histórico';
        btn.style.cssText = "position: fixed; top: 15px; right: 15px; z-index: 99999; padding: 12px 20px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.3);";
        btn.onclick = processarDocumento;
        document.body.appendChild(btn);
    }

    window.addEventListener('load', criarBotao);
    setTimeout(criarBotao, 2000);
})();
