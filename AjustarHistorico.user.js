// ==UserScript==
// @name         Ajustar Impressão Histórico - SIGEDUCA
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Menu para ajustar a impressão do histórico escolar.
// @author       Elder Martins
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwgedteladocumento.aspx?0,36
// @updateURL    https://raw.githubusercontent.com/donidozh/Ferramentas-SIGEDUCA/main/InstaladorScripts.user.js
// @downloadURL  https://raw.githubusercontent.com/donidozh/Ferramentas-SIGEDUCA/main/InstaladorScripts.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURAÇÕES E CONSTANTES (Otimizador) ---
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

    // --- ESTILOS DO MENU ---
    GM_addStyle(`
        .menu-elder-container {
            position: fixed;
            top: 15px;
            right: 15px;
            z-index: 99999;
            font-family: Arial, sans-serif;
        }
        .btn-principal {
            background: #007bff;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            min-width: 170px;
            text-align: center;
        }
        .btn-principal:active { transform: scale(0.98); }

        .dropdown-content {
            display: none; /* Escondido por padrão */
            position: absolute;
            right: 0;
            background-color: #ffffff;
            min-width: 210px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            border-radius: 8px;
            margin-top: 8px;
            overflow: hidden;
            border: 1px solid #ddd;
        }

        /* Classe para mostrar o menu via JS */
        .dropdown-content.show {
            display: block;
            animation: fadeIn 0.2s;
        }

        .dropdown-content button {
            color: #333;
            padding: 14px 16px;
            display: block;
            width: 100%;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
            border-bottom: 1px solid #eee;
            transition: background 0.2s;
        }
        .dropdown-content button:last-child { border-bottom: none; }
        .dropdown-content button:hover { background-color: #f8f9fa; color: #007bff; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media print {
            .menu-elder-container { display: none !important; }
            img { max-width: 100% !important; height: auto !important; }
        }
    `);

    // --- FUNÇÕES DE APOIO ---
    function criarSpan(textoHtml) {
        const span = document.createElement('span');
        span.style.cssText = "font-size: 10px; font-weight: bold; display: inline-block; line-height: 1.1; text-align: center; width: 100%; opacity: 0.65;";
        span.innerHTML = textoHtml;
        return span;
    }

    // --- FUNÇÃO: REDUZIR HISTÓRICO ---
    function reduzirHistorico() {
        const celulas = document.querySelectorAll('td');
        let contador = 0;

        celulas.forEach(celula => {
            const texto = celula.innerText.toUpperCase().trim();
            if (texto === "") return;

            let areaHtml = "";

            if (texto.startsWith("APROFUNDAMENTO –") || texto.startsWith("APROFUNDAMENTO -") || texto === "LEITURA E PRODUÇÃO DE TEXTO") {
                areaHtml = AREAS.AP_ESTUDOS;
            }
            else if (["SOCIOLOGIA IF/TA", "HISTÓRIA IF/TA", "GEOGRAFIA IF/TA", "FILOSOFIA IF/TA"].includes(texto)) {
                areaHtml = AREAS.T_HUM_CHSA;
            }
            else if (["BIOLOGIA IF/TA", "FÍSICA IF/TA", "QUÍMICA IF/TA"].includes(texto)) {
                areaHtml = AREAS.T_NAT_CNT;
            }
            else if (["L.ESTRANGEIRA IF/TA", "L.ESTRANG (INGLÊS) IF/TA", "LINGUA INGLESA IF/TA", "ARTE IF/TA", "LÍNGUA PORTUGUESA"].includes(texto)) {
                areaHtml = AREAS.T_LIN_LGG;
            }
            else if (texto === "PROJETO DE VIDA IF/TA") {
                areaHtml = AREAS.ITI;
            }
            else if (texto === "MATEMÁTICA") areaHtml = AREAS.MAT;
            else if (["HISTÓRIA", "GEOGRAFIA", "SOCIOLOGIA", "FILOSOFIA"].includes(texto)) areaHtml = AREAS.HUM;
            else if (["ARTE", "EDUCAÇÃO FÍSICA", "LINGUA PORTUGUESA", "L.ESTRANG (INGLÊS)", "LÍNGUA INGLESA"].includes(texto)) areaHtml = AREAS.LIN;
            else if (["BIOLOGIA", "FÍSICA", "QUÍMICA"].includes(texto)) areaHtml = AREAS.NAT;
            else if (texto.includes("ELETIVA")) areaHtml = AREAS.ELE;
            else if (texto === "PROJETO DE VIDA") areaHtml = AREAS.PV;

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
        alert(`✓ Histórico reduzido: ${contador} áreas processadas.`);
    }

    // --- FUNÇÃO: REMOVER SEM VALOR E AJUSTAR LAYOUT ---
    function ajustarLayout() {
        document.querySelectorAll("table, div, td, th").forEach(el => {
            if (el.tagName === "TABLE" || el.id === "content" || el.style.width) {
                el.style.width = "100%";
                if (el.tagName === "TABLE") el.style.tableLayout = "auto";
            }
        });

        document.querySelectorAll('img[src="imagem/documentosemvalor.jpg"]').forEach(img => img.remove());

        document.querySelectorAll("script").forEach(scr => {
            if (scr.innerText.includes("window.print")) scr.remove();
        });

        alert("✅ Marca d'água removida e layout ajustado!");
        const btnRemover = document.getElementById('btn-remover-sem-valor');
        if(btnRemover) btnRemover.style.color = "#28a745";
    }

    // --- CONSTRUÇÃO DA INTERFACE ---
    function iniciarMenu() {
        if (document.querySelector('.menu-elder-container')) return;

        const container = document.createElement('div');
        container.className = 'menu-elder-container';

        const btnPrincipal = document.createElement('button');
        btnPrincipal.className = 'btn-principal';
        btnPrincipal.innerText = 'Ajustar Impressão ▾';

        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-content';
        dropdown.id = 'elder-dropdown';

        // Botão 1: Reduzir Histórico
        const btnReduzir = document.createElement('button');
        btnReduzir.innerText = '📊 Reduzir Histórico';
        btnReduzir.onclick = (e) => { e.stopPropagation(); reduzirHistorico(); dropdown.classList.remove('show'); };
        dropdown.appendChild(btnReduzir);

        // Botão 2: Remover Sem Valor (Condicional)
        const temMarcaAgua = document.querySelector('img[src="imagem/documentosemvalor.jpg"]');
        if (temMarcaAgua) {
            const btnRemover = document.createElement('button');
            btnRemover.id = 'btn-remover-sem-valor';
            btnRemover.innerText = '📄 Remover Sem Valor';
            btnRemover.onclick = (e) => { e.stopPropagation(); ajustarLayout(); dropdown.classList.remove('show'); };
            dropdown.appendChild(btnRemover);
        }

        // Lógica de clique para abrir/fechar
        btnPrincipal.onclick = (e) => {
            e.stopPropagation(); // Impede que o clique feche o menu imediatamente
            dropdown.classList.toggle('show');
        };

        // Fechar ao clicar fora do menu
        window.addEventListener('click', () => {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });

        container.appendChild(btnPrincipal);
        container.appendChild(dropdown);
        document.body.appendChild(container);
    }

    window.addEventListener('load', iniciarMenu);
    setTimeout(iniciarMenu, 2000);
})();
