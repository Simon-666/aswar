/**
 * Premium Modular Aquarium Calculator Component
 * Designed for Middle Eastern Freshwater Ecosystems
 * 
 * Auto-injects HTML structure and handles reactive state updates.
 */
class AquariumCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`AquariumCalculator: Container ID "${containerId}" not found.`);
            return;
        }
        
        // Initial state values
        this.state = {
            activeTab: 'vol', // 'vol', 'temp', 'water'
            
            // Vol Tab
            length: 100,
            width: 45,
            height: 50,
            avgFishSize: 5,
            
            // Temp Tab
            tankVol: 225,
            ambientTemp: 45,
            targetTemp: 25,
            
            // Water Tab
            tapTds: 1200,
            targetTds: 250,
            tapPh: 8.4,
            targetPh: 7.2
        };

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateCalculations();
    }

    render() {
        this.container.innerHTML = `
            <div class="glass-card" style="padding: 20px;">
                <!-- Widget Header -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.15); display: flex; align-items: center; justify-center; color: var(--color-primary); justify-content: center;">
                        <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M15 11h.01M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style="font-weight: 800; font-size: 15px; color: var(--text-primary); margin: 0;">حاسبة الأكواريوم التفاعلية</h3>
                        <p style="font-size: 11px; color: var(--color-primary); margin: 0;">إعدادات متطابقة مع مياه ومناخ المنطقة</p>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="tab-nav">
                    <button class="tab-btn ${this.state.activeTab === 'vol' ? 'active' : ''}" data-tab="vol">الحجم والأسماك</button>
                    <button class="tab-btn ${this.state.activeTab === 'temp' ? 'active' : ''}" data-tab="temp">التبريد والحرارة</button>
                    <button class="tab-btn ${this.state.activeTab === 'water' ? 'active' : ''}" data-tab="water">تعديل الأملاح</button>
                </div>

                <!-- Tab Panels -->
                <!-- 1. Volume & Stocking -->
                <div id="pane-vol" class="tab-pane ${this.state.activeTab === 'vol' ? 'active' : ''}">
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">طول الحوض (سم)</span>
                            <span id="val-length" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.length} سم</span>
                        </div>
                        <input type="range" id="range-length" min="30" max="300" step="5" value="${this.state.length}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">عرض الحوض (سم)</span>
                            <span id="val-width" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.width} سم</span>
                        </div>
                        <input type="range" id="range-width" min="20" max="150" step="5" value="${this.state.width}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">ارتفاع الحوض (سم)</span>
                            <span id="val-height" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.height} سم</span>
                        </div>
                        <input type="range" id="range-height" min="20" max="150" step="5" value="${this.state.height}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">متوسط حجم السمكة (سم)</span>
                            <span id="val-avg-size" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.avgFishSize} سم</span>
                        </div>
                        <input type="range" id="range-avg-size" min="2" max="25" step="1" value="${this.state.avgFishSize}">
                    </div>

                    <div class="output-box">
                        <div class="output-row">
                            <span class="output-label">السعة المائية الكلية:</span>
                            <span id="out-volume" class="output-value primary">0 لتر</span>
                        </div>
                        <div class="output-row">
                            <span class="output-label">أقصى سعة أسماك (طول تراكمي):</span>
                            <span id="out-stock-cm" class="output-value success">0 سم</span>
                        </div>
                        <div class="output-row">
                            <span class="output-label">العدد المقدر للأسماك:</span>
                            <span id="out-stock-count" class="output-value success">0 أسماك</span>
                        </div>
                        <div class="output-note">
                            ⚠️ تم تطبيق قاعدة (1 سم سمكة لكل 1 لتر مياه). للأسماك النهرية الكبيرة النشطة في منطقتنا (مثل البني والشبوط)، يوصى بتقليل العدد بنسبة 40% لتوفير مساحة سباحة كافية.
                        </div>
                    </div>
                </div>

                <!-- 2. Temperature & Cooling -->
                <div id="pane-temp" class="tab-pane ${this.state.activeTab === 'temp' ? 'active' : ''}">
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">حجم مياه الحوض (لتر)</span>
                            <span id="val-tank-vol" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.tankVol} لتر</span>
                        </div>
                        <input type="range" id="range-tank-vol" min="10" max="1500" step="10" value="${this.state.tankVol}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">أعلى حرارة للغرفة في الصيف (°م)</span>
                            <span id="val-ambient" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.ambientTemp}°م</span>
                        </div>
                        <input type="range" id="range-ambient" min="20" max="55" step="1" value="${this.state.ambientTemp}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">الحرارة المستهدفة للماء (°م)</span>
                            <span id="val-target-temp" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.targetTemp}°م</span>
                        </div>
                        <input type="range" id="range-target-temp" min="18" max="32" step="1" value="${this.state.targetTemp}">
                    </div>

                    <div class="output-box">
                        <div class="output-row">
                            <span class="output-label">فرق درجة الحرارة المطلوب خفضه:</span>
                            <span id="out-temp-delta" class="output-value primary">0°م</span>
                        </div>
                        <div class="output-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="output-label">التبريد الصيفي الموصى به:</span>
                            <span id="out-cooling-sys" class="output-value primary" style="font-size: 13px; text-align: right; width: 100%; margin-top: 4px;">-</span>
                        </div>
                        <div class="output-row">
                            <span class="output-label">طاقة السخان الشتوي:</span>
                            <span id="out-heating-sys" class="output-value success">0 واط</span>
                        </div>
                        <div class="output-note">
                            🌡️ عندما تتعدى حرارة الغرفة 40°م، لا تجدي المراوح نفعاً للأحواض الكبيرة بسبب زيادة معدل التبخر الذي يرفع ملوحة الحوض بشكل حاد؛ استخدام المبردات (Chillers) الفريونية ضروري.
                        </div>
                    </div>
                </div>

                <!-- 3. Water Parameters -->
                <div id="pane-water" class="tab-pane ${this.state.activeTab === 'water' ? 'active' : ''}">
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">ملوحة مياه الصنبور (TDS - ppm)</span>
                            <span id="val-tap-tds" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.tapTds} ppm</span>
                        </div>
                        <input type="range" id="range-tap-tds" min="100" max="2500" step="50" value="${this.state.tapTds}">
                    </div>
                    <div class="input-group">
                        <div style="display: flex; justify-content: space-between;">
                            <span class="input-label">الملوحة المستهدفة (TDS - ppm)</span>
                            <span id="val-target-tds" style="font-size:12px; font-weight:700; color:var(--text-primary);">${this.state.targetTds} ppm</span>
                        </div>
                        <input type="range" id="range-target-tds" min="50" max="1000" step="25" value="${this.state.targetTds}">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                        <div class="input-group">
                            <span class="input-label">الرقم الهيدروجيني للحنفية (pH)</span>
                            <input type="number" id="num-tap-ph" step="0.1" min="5" max="10" value="${this.state.tapPh}" class="input-field" style="padding: 6px 12px;">
                        </div>
                        <div class="input-group">
                            <span class="input-label">الـ pH المستهدف</span>
                            <input type="number" id="num-target-ph" step="0.1" min="5" max="10" value="${this.state.targetPh}" class="input-field" style="padding: 6px 12px;">
                        </div>
                    </div>

                    <div class="output-box">
                        <div class="output-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="output-label">وصفة خلط المياه المثالية:</span>
                            <span id="out-water-mix" class="output-value primary" style="font-size: 13px; margin-top: 4px; text-align: right; width: 100%;">0%</span>
                        </div>
                        <div class="output-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="output-label">إجراءات خفض الرقم الهيدروجيني (pH):</span>
                            <span id="out-ph-action" class="output-value success" style="font-size: 13px; margin-top: 4px; text-align: right; width: 100%;">-</span>
                        </div>
                        <div class="output-note">
                            💧 مياه نهري دجلة والفرات ومياه الآبار والتحلية بالمنطقة تتميز بارتفاع العسر الكلي والـ pH. الحل السليم يكمن في دمج مياه التناضح العكسي (RO) الغنية بالغازات الذائبة.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Tab switching
        const tabBtns = this.container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.state.activeTab = tab;
                
                // Update UI state
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const panes = this.container.querySelectorAll('.tab-pane');
                panes.forEach(p => p.classList.remove('active'));
                
                const activePane = this.container.querySelector(`#pane-${tab}`);
                if (activePane) activePane.classList.add('active');
            });
        });

        // Event listeners for Vol Tab ranges
        const rLength = this.container.querySelector('#range-length');
        const rWidth = this.container.querySelector('#range-width');
        const rHeight = this.container.querySelector('#range-height');
        const rAvgSize = this.container.querySelector('#range-avg-size');

        const updateVolState = () => {
            this.state.length = parseInt(rLength.value);
            this.state.width = parseInt(rWidth.value);
            this.state.height = parseInt(rHeight.value);
            this.state.avgFishSize = parseInt(rAvgSize.value);

            this.container.querySelector('#val-length').innerText = `${this.state.length} سم`;
            this.container.querySelector('#val-width').innerText = `${this.state.width} سم`;
            this.container.querySelector('#val-height').innerText = `${this.state.height} سم`;
            this.container.querySelector('#val-avg-size').innerText = `${this.state.avgFishSize} سم`;

            // Auto sync calculated volume to Temp Tab volume input state
            const calculatedVol = Math.round((this.state.length * this.state.width * this.state.height) / 1000);
            this.state.tankVol = calculatedVol;
            const rTankVol = this.container.querySelector('#range-tank-vol');
            if (rTankVol) {
                rTankVol.value = calculatedVol;
                this.container.querySelector('#val-tank-vol').innerText = `${calculatedVol} لتر`;
            }

            this.updateCalculations();
        };

        if (rLength) {
            rLength.addEventListener('input', updateVolState);
            rWidth.addEventListener('input', updateVolState);
            rHeight.addEventListener('input', updateVolState);
            rAvgSize.addEventListener('input', updateVolState);
        }

        // Event listeners for Temp Tab ranges
        const rTankVol = this.container.querySelector('#range-tank-vol');
        const rAmbient = this.container.querySelector('#range-ambient');
        const rTargetTemp = this.container.querySelector('#range-target-temp');

        const updateTempState = () => {
            this.state.tankVol = parseInt(rTankVol.value);
            this.state.ambientTemp = parseInt(rAmbient.value);
            this.state.targetTemp = parseInt(rTargetTemp.value);

            this.container.querySelector('#val-tank-vol').innerText = `${this.state.tankVol} لتر`;
            this.container.querySelector('#val-ambient').innerText = `${this.state.ambientTemp}°م`;
            this.container.querySelector('#val-target-temp').innerText = `${this.state.targetTemp}°م`;

            this.updateCalculations();
        };

        if (rTankVol) {
            rTankVol.addEventListener('input', updateTempState);
            rAmbient.addEventListener('input', updateTempState);
            rTargetTemp.addEventListener('input', updateTempState);
        }

        // Event listeners for Water Tab inputs
        const rTapTds = this.container.querySelector('#range-tap-tds');
        const rTargetTds = this.container.querySelector('#range-target-tds');
        const nTapPh = this.container.querySelector('#num-tap-ph');
        const nTargetPh = this.container.querySelector('#num-target-ph');

        const updateWaterState = () => {
            this.state.tapTds = parseInt(rTapTds.value);
            this.state.targetTds = parseInt(rTargetTds.value);
            this.state.tapPh = parseFloat(nTapPh.value) || 7.0;
            this.state.targetPh = parseFloat(nTargetPh.value) || 7.0;

            this.container.querySelector('#val-tap-tds').innerText = `${this.state.tapTds} ppm`;
            this.container.querySelector('#val-target-tds').innerText = `${this.state.targetTds} ppm`;

            this.updateCalculations();
        };

        if (rTapTds) {
            rTapTds.addEventListener('input', updateWaterState);
            rTargetTds.addEventListener('input', updateWaterState);
            nTapPh.addEventListener('input', updateWaterState);
            nTargetPh.addEventListener('input', updateWaterState);
        }
    }

    updateCalculations() {
        // 1. Volume & Stocking Tab logic
        const volume = (this.state.length * this.state.width * this.state.height) / 1000;
        const roundedVol = Math.round(volume * 10) / 10;
        const maxStockingCm = Math.round(volume);
        const estimatedFishCount = Math.floor(maxStockingCm / this.state.avgFishSize);

        const outVol = this.container.querySelector('#out-volume');
        const outStockCm = this.container.querySelector('#out-stock-cm');
        const outStockCount = this.container.querySelector('#out-stock-count');

        if (outVol) outVol.innerText = `${roundedVol} لتر`;
        if (outStockCm) outStockCm.innerText = `${maxStockingCm} سم تراكمي`;
        if (outStockCount) outStockCount.innerText = `${estimatedFishCount} أسماك (حجم ${this.state.avgFishSize}سم)`;

        // 2. Temp & Cooling Tab logic
        const tempDelta = Math.max(0, this.state.ambientTemp - this.state.targetTemp);
        const outTempDelta = this.container.querySelector('#out-temp-delta');
        if (outTempDelta) outTempDelta.innerText = `${tempDelta}°م`;

        let coolingRecommendation = "";
        if (this.state.tankVol <= 0) {
            coolingRecommendation = "حدد حجم الحوض أولاً";
        } else if (tempDelta <= 2) {
            coolingRecommendation = "لا يتطلب نظام تبريد خاص (التهوية العادية للغرفة كافية)";
        } else if (tempDelta <= 4 && this.state.tankVol <= 100) {
            coolingRecommendation = "نظام مراوح تبريد تبخيرية مزدوجة (يخفض من 2-4 درجات)";
        } else {
            // Summer Heat High Delta or Large Aquarium Volume
            const vol = this.state.tankVol;
            if (vol < 80) {
                coolingRecommendation = "مروحة تبخيرية رباعية أو مبرد إلكتروني حراري (Peltier)";
            } else if (vol <= 160) {
                coolingRecommendation = "مبرد فريون (Chiller) قوة 1/12 حصان";
            } else if (vol <= 320) {
                coolingRecommendation = "مبرد فريون (Chiller) قوة 1/10 حصان";
            } else if (vol <= 600) {
                coolingRecommendation = "مبرد فريون (Chiller) قوة 1/4 حصان";
            } else {
                coolingRecommendation = "مبرد فريون (Chiller) قوة 1/2 حصان أو مكيف هواء مخصص للغرفة";
            }
        }
        
        const outCooling = this.container.querySelector('#out-cooling-sys');
        if (outCooling) outCooling.innerText = coolingRecommendation;

        // Winter heater sizing (~1 Watt per 1 Liter for average room)
        const heaterWattage = Math.round(this.state.tankVol * 1.0);
        let heaterText = "";
        if (heaterWattage <= 25) heaterText = "سخان 25 واط";
        else if (heaterWattage <= 50) heaterText = "سخان 50 واط";
        else if (heaterWattage <= 100) heaterText = "سخان 100 واط";
        else if (heaterWattage <= 200) heaterText = "سخان 200 واط";
        else if (heaterWattage <= 300) heaterText = "سخان 300 واط";
        else heaterText = `سخانين بقوة إجمالية تبلغ ${heaterWattage} واط`;

        const outHeating = this.container.querySelector('#out-heating-sys');
        if (outHeating) outHeating.innerText = heaterText;

        // 3. Water Parameter Tab logic
        const tapTds = this.state.tapTds;
        const targetTds = this.state.targetTds;
        const roTds = 15; // standard RO system output TDS
        
        let mixResult = "";
        if (tapTds <= targetTds) {
            mixResult = "مياه الحنفية ممتازة وملوحتها مناسبة ولا تتطلب مياه RO";
        } else if (targetTds <= roTds) {
            mixResult = "يتطلب مياه RO نقية 100% مع إضافة أملاح معدنية مخصصة للأحواض";
        } else {
            const roPercentage = (tapTds - targetTds) / (tapTds - roTds);
            const roPct = Math.round(roPercentage * 100);
            const tapPct = 100 - roPct;
            mixResult = `خلط: ${roPct}% مياه تناضح عكسي (RO) + ${tapPct}% مياه حنفية معالجة بالكلور`;
        }

        const outWaterMix = this.container.querySelector('#out-water-mix');
        if (outWaterMix) outWaterMix.innerText = mixResult;

        const tapPh = this.state.tapPh;
        const targetPh = this.state.targetPh;
        let phActionText = "";

        if (tapPh <= targetPh) {
            phActionText = "الـ pH الحالي مناسب ولا يحتاج لتعديل للأسفل.";
        } else {
            const phDiff = tapPh - targetPh;
            if (phDiff < 0.4) {
                phActionText = "إضافة أوراق الكاتابا الطبيعية (أوراق اللوز الهندي) بمعدل ورقة لكل 50 لتر.";
            } else if (phDiff < 1.0) {
                phActionText = "تصفية المياه عبر الخث الطبيعي (Peat Moss) في الفلتر، مع الخلط بالـ RO.";
            } else {
                phActionText = "الخلط المكثف بالـ RO هو الحل الأمثل خفضاً آمناً، أو استخدام مخفضات pH كيميائية بجرعات بطيئة للغاية لعدم صدم الأسماك.";
            }
        }

        const outPhAction = this.container.querySelector('#out-ph-action');
        if (outPhAction) outPhAction.innerText = phActionText;
    }
}

// Auto-initialize when file is included in simple setups
window.initAquariumCalculator = function(containerId) {
    return new AquariumCalculator(containerId);
};
