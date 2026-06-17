/**
 * Premium Modular Aquarium Calculator - Middle East Edition
 * Updates: Focus on non-chiller practical cooling (air pumps, surface agitation, room AC coordination)
 */
class AquariumCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`AquariumCalculator: Container "${containerId}" not found.`);
            return;
        }

        // Initial state values
        let defaultTab = 'vol';
        const hash = window.location.hash.substring(1);
        if (['vol', 'temp', 'water'].includes(hash)) {
            defaultTab = hash;
        }

        this.state = {
            activeTab: defaultTab,
            // Tank parameters
            length: 100,
            width: 40,
            height: 50,
            avgFishSize: 5,
            // Cooling parameters (summer)
            tankVol: 200,
            ambientTemp: 45,
            targetTemp: 25,
            // Chemistry parameters
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
            <div class="calc-widget">
                <!-- Widget Header -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid rgba(14, 165, 233, 0.15); padding-bottom: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(14, 165, 233, 0.15); display: flex; align-items: center; justify-content: center; color: var(--calc-primary);">
                        <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 style="font-weight: 800; font-size: 15px; color: #f8fafc; margin: 0;">حاسبة الأكواريوم التفاعلية</h3>
                        <p style="font-size: 11px; color: var(--calc-primary); margin: 0;">الحلول الاقتصادية لتبريد وتعديل مياه الحوض</p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="calc-tabs">
                    <button class="calc-tab-btn ${this.state.activeTab === 'vol' ? 'active' : ''}" data-tab="vol">الحجم والسعة</button>
                    <button class="calc-tab-btn ${this.state.activeTab === 'temp' ? 'active' : ''}" data-tab="temp">إدارة الصيف والتبريد</button>
                    <button class="calc-tab-btn ${this.state.activeTab === 'water' ? 'active' : ''}" data-tab="water">ملوحة ومزج المياه</button>
                </div>

                <!-- Tab Panels -->
                
                <!-- 1. Volume & Stocking -->
                <div id="pane-vol" class="calc-pane ${this.state.activeTab === 'vol' ? 'active' : ''}">
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">طول الحوض (سم)</span>
                            <span id="val-length" class="calc-value-badge">${this.state.length} سم</span>
                        </div>
                        <input type="range" id="range-length" min="30" max="250" step="5" class="calc-slider" value="${this.state.length}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">عرض الحوض (سم)</span>
                            <span id="val-width" class="calc-value-badge">${this.state.width} سم</span>
                        </div>
                        <input type="range" id="range-width" min="20" max="120" step="5" class="calc-slider" value="${this.state.width}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">ارتفاع الحوض (سم)</span>
                            <span id="val-height" class="calc-value-badge">${this.state.height} سم</span>
                        </div>
                        <input type="range" id="range-height" min="20" max="120" step="5" class="calc-slider" value="${this.state.height}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">متوسط حجم السمكة (سم)</span>
                            <span id="val-avg-size" class="calc-value-badge">${this.state.avgFishSize} سم</span>
                        </div>
                        <input type="range" id="range-avg-size" min="2" max="20" step="1" class="calc-slider" value="${this.state.avgFishSize}">
                    </div>

                    <div class="calc-results">
                        <div class="calc-result-row">
                            <span class="calc-result-label">حجم المياه الإجمالي:</span>
                            <span id="out-volume" class="calc-result-val primary">0 لتر</span>
                        </div>
                        <div class="calc-result-row">
                            <span class="calc-result-label">الحد الأقصى لطول الأسماك:</span>
                            <span id="out-stock-cm" class="calc-result-val success">0 سم</span>
                        </div>
                        <div class="calc-result-row">
                            <span class="calc-result-label">العدد المقدر للأسماك:</span>
                            <span id="out-stock-count" class="calc-result-val success">0 أسماك</span>
                        </div>
                        <div class="calc-alert-box success">
                            📝 <strong>معيار السعة:</strong> تم استخدام قاعدة (1 لتر لكل 1 سم من طول السمكة). للأسماك المحلية مثل البني، يوصى بمضاعفة السعة لكل سمكة.
                        </div>
                    </div>
                </div>

                <!-- 2. Temperature & cooling (Practical non-chiller advice) -->
                <div id="pane-temp" class="calc-pane ${this.state.activeTab === 'temp' ? 'active' : ''}">
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">حجم الحوض (لتر)</span>
                            <span id="val-tank-vol" class="calc-value-badge">${this.state.tankVol} لتر</span>
                        </div>
                        <input type="range" id="range-tank-vol" min="10" max="1000" step="10" class="calc-slider" value="${this.state.tankVol}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">أعلى حرارة متوقعة للغرفة (°م)</span>
                            <span id="val-ambient" class="calc-value-badge">${this.state.ambientTemp}°م</span>
                        </div>
                        <input type="range" id="range-ambient" min="25" max="52" step="1" class="calc-slider" value="${this.state.ambientTemp}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">الحرارة المستهدفة للماء (°م)</span>
                            <span id="val-target-temp" class="calc-value-badge">${this.state.targetTemp}°م</span>
                        </div>
                        <input type="range" id="range-target-temp" min="20" max="30" step="1" class="calc-slider" value="${this.state.targetTemp}">
                    </div>

                    <div class="calc-results">
                        <div class="calc-result-row">
                            <span class="calc-result-label">الفارق الحراري المطلوب خفضه:</span>
                            <span id="out-temp-delta" class="calc-result-val primary">0°م</span>
                        </div>
                        
                        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 5px;">
                            <h5 style="color: #38bdf8; font-size:12px; font-weight:700; margin-bottom:8px;">إجراءات تبريد اقتصادية (بدون مبرد فريون مكلف):</h5>
                            <ul id="cooling-action-list" style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding-right: 0;">
                                <!-- dynamically generated list items -->
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 3. Water parameters (RO mixing) -->
                <div id="pane-water" class="calc-pane ${this.state.activeTab === 'water' ? 'active' : ''}">
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">ملوحة مياه الحنفية (TDS - ppm)</span>
                            <span id="val-tap-tds" class="calc-value-badge">${this.state.tapTds} ppm</span>
                        </div>
                        <input type="range" id="range-tap-tds" min="100" max="2200" step="50" class="calc-slider" value="${this.state.tapTds}">
                    </div>
                    <div class="calc-control">
                        <div class="calc-label-row">
                            <span class="calc-label">الملوحة المستهدفة (TDS - ppm)</span>
                            <span id="val-target-tds" class="calc-value-badge">${this.state.targetTds} ppm</span>
                        </div>
                        <input type="range" id="range-target-tds" min="50" max="800" step="25" class="calc-slider" value="${this.state.targetTds}">
                    </div>
                    
                    <div class="calc-input-row">
                        <div class="calc-input-box">
                            <span class="calc-label" style="font-size:11px;">الـ pH للحنفية</span>
                            <input type="number" id="num-tap-ph" step="0.1" min="5.0" max="9.5" class="calc-number-field" value="${this.state.tapPh}">
                        </div>
                        <div class="calc-input-box">
                            <span class="calc-label" style="font-size:11px;">الـ pH المستهدف</span>
                            <input type="number" id="num-target-ph" step="0.1" min="5.0" max="9.5" class="calc-number-field" value="${this.state.targetPh}">
                        </div>
                    </div>

                    <div class="calc-results">
                        <div class="calc-result-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="calc-result-label">توزيع خلط المياه الموصى به:</span>
                            <span id="out-water-mix" class="calc-result-val primary" style="font-size:13px; text-align:right; width:100%; margin-top:4px;">0%</span>
                        </div>
                        <div class="calc-result-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                            <span class="calc-result-label">إجراءات خفض الرقم الهيدروجيني:</span>
                            <span id="out-ph-action" class="calc-result-val success" style="font-size:12px; text-align:right; width:100%; margin-top:4px;">-</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const tabBtns = this.container.querySelectorAll('.calc-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.state.activeTab = tab;
                window.location.hash = tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const panes = this.container.querySelectorAll('.calc-pane');
                panes.forEach(p => p.classList.remove('active'));

                const activePane = this.container.querySelector(`#pane-${tab}`);
                if (activePane) activePane.classList.add('active');
            });
        });

        // 1. Volume Bindings
        const rLength = this.container.querySelector('#range-length');
        const rWidth = this.container.querySelector('#range-width');
        const rHeight = this.container.querySelector('#range-height');
        const rAvgSize = this.container.querySelector('#range-avg-size');

        const updateVol = () => {
            this.state.length = parseInt(rLength.value);
            this.state.width = parseInt(rWidth.value);
            this.state.height = parseInt(rHeight.value);
            this.state.avgFishSize = parseInt(rAvgSize.value);

            this.container.querySelector('#val-length').innerText = `${this.state.length} سم`;
            this.container.querySelector('#val-width').innerText = `${this.state.width} سم`;
            this.container.querySelector('#val-height').innerText = `${this.state.height} سم`;
            this.container.querySelector('#val-avg-size').innerText = `${this.state.avgFishSize} سم`;

            const calcVolume = Math.round((this.state.length * this.state.width * this.state.height) / 1000);
            this.state.tankVol = calcVolume;
            const rTankVol = this.container.querySelector('#range-tank-vol');
            if (rTankVol) {
                rTankVol.value = calcVolume;
                this.container.querySelector('#val-tank-vol').innerText = `${calcVolume} لتر`;
            }

            this.updateCalculations();
        };

        if (rLength) {
            rLength.addEventListener('input', updateVol);
            rWidth.addEventListener('input', updateVol);
            rHeight.addEventListener('input', updateVol);
            rAvgSize.addEventListener('input', updateVol);
        }

        // 2. Temp Bindings
        const rTankVol = this.container.querySelector('#range-tank-vol');
        const rAmbient = this.container.querySelector('#range-ambient');
        const rTargetTemp = this.container.querySelector('#range-target-temp');

        const updateTemp = () => {
            this.state.tankVol = parseInt(rTankVol.value);
            this.state.ambientTemp = parseInt(rAmbient.value);
            this.state.targetTemp = parseInt(rTargetTemp.value);

            this.container.querySelector('#val-tank-vol').innerText = `${this.state.tankVol} لتر`;
            this.container.querySelector('#val-ambient').innerText = `${this.state.ambientTemp}°م`;
            this.container.querySelector('#val-target-temp').innerText = `${this.state.targetTemp}°م`;

            this.updateCalculations();
        };

        if (rTankVol) {
            rTankVol.addEventListener('input', updateTemp);
            rAmbient.addEventListener('input', updateTemp);
            rTargetTemp.addEventListener('input', updateTemp);
        }

        // 3. Water Bindings
        const rTapTds = this.container.querySelector('#range-tap-tds');
        const rTargetTds = this.container.querySelector('#range-target-tds');
        const nTapPh = this.container.querySelector('#num-tap-ph');
        const nTargetPh = this.container.querySelector('#num-target-ph');

        const updateWater = () => {
            this.state.tapTds = parseInt(rTapTds.value);
            this.state.targetTds = parseInt(rTargetTds.value);
            this.state.tapPh = parseFloat(nTapPh.value) || 7.0;
            this.state.targetPh = parseFloat(nTargetPh.value) || 7.0;

            this.container.querySelector('#val-tap-tds').innerText = `${this.state.tapTds} ppm`;
            this.container.querySelector('#val-target-tds').innerText = `${this.state.targetTds} ppm`;

            this.updateCalculations();
        };

        if (rTapTds) {
            rTapTds.addEventListener('input', updateWater);
            rTargetTds.addEventListener('input', updateWater);
            nTapPh.addEventListener('input', updateWater);
            nTargetPh.addEventListener('input', updateWater);
        }
    }

    updateCalculations() {
        // Tab 1 calculations
        const volume = (this.state.length * this.state.width * this.state.height) / 1000;
        const roundedVol = Math.round(volume * 10) / 10;
        const maxStocking = Math.round(volume);
        const fishCount = Math.floor(maxStocking / this.state.avgFishSize);

        const oVol = this.container.querySelector('#out-volume');
        const oStock = this.container.querySelector('#out-stock-cm');
        const oCount = this.container.querySelector('#out-stock-count');

        if (oVol) oVol.innerText = `${roundedVol} لتر`;
        if (oStock) oStock.innerText = `${maxStocking} سم إجمالاً`;
        if (oCount) oCount.innerText = `${fishCount} أسماك`;

        // Tab 2 calculations - Realistic Non-Chiller Cooling
        const tempDelta = Math.max(0, this.state.ambientTemp - this.state.targetTemp);
        const oDelta = this.container.querySelector('#out-temp-delta');
        if (oDelta) oDelta.innerText = `${tempDelta}°م`;

        const coolingList = this.container.querySelector('#cooling-action-list');
        if (coolingList) {
            coolingList.innerHTML = '';
            
            if (tempDelta === 0) {
                coolingList.innerHTML = '<li style="color:var(--calc-success);">✓ درجة حرارة الغرفة ملائمة للمعدل المستهدف. لا حاجة للتبريد الإضافي.</li>';
            } else {
                // Generate step-by-step practical suggestions based on delta and volume
                const actions = [];
                
                // 1. Air Pump & Dissolved Oxygen
                actions.push({
                    title: "زيادة التبخر وتبادل الغازات (مضخة الهواء)",
                    desc: "شغل مضخة هواء قوية مع حجري هواء. الماء الدافئ يفقد الأكسجين بسرعة؛ صعود الفقاعات يزيد مساحة التلامس بين الماء والهواء، مما يسرع التبريد الذاتي بالتبخير ويعوض الأكسجين المفقود."
                });

                // 2. Surface Agitation
                actions.push({
                    title: "تحريك سطح الماء بالفلتر / مضخة التيار",
                    desc: "وجه مخرجات الفلتر أو مضخة تيار صغيرة للأعلى لكسر سطح الماء بقوة. التموج السطحي المستمر يضاعف من معدل تبدد الحرارة الكامنة عبر تبخير الماء الحار."
                });

                // 3. Evaporative Fan
                actions.push({
                    title: "توجيه مروحة تبريد تبخيرية (بقدرة 12 فولت)",
                    desc: "ثبت مروحة هواء صغيرة موجهة مباشرة بزاوية 45 درجة نحو السطح. هذه الطريقة تخفض حرارة الماء بمقدار 2°م إلى 4°م بمجرد استغلال برودة التبخير."
                });

                // 4. Room Cooling Coordination
                if (this.state.ambientTemp >= 40) {
                    actions.push({
                        title: "تنسيق تكييف الغرفة (المكيف المنزلي)",
                        desc: `بما أن درجة حرارة الغرفة (${this.state.ambientTemp}°م) مرتفعة جداً، فالمروحة وحدها لن تكفي. شغل تكييف الغرفة خلال ساعات الذروة (11 صباحاً - 4 مساءً) لتقليص الحرارة المحيطة للغرفة إلى حوالي 28°م، مما يريح كاهل الحوض.`
                    });
                }

                // 5. ATO Warning (Daily Top-Off)
                actions.push({
                    title: "تعويض التبخر بماء RO حصراً (هام جداً)",
                    desc: "التبخير المكثف سيخفض منسوب المياه يومياً. يجب استخدام نظام ATO (التعويض التلقائي) أو تعبئة الفارق بماء RO (خالٍ من الأملاح). إذا عوّضت الفاقد بماء الحنفية، سترتفع ملوحة الحوض بشكل قاتل مع الوقت!"
                });

                // 6. Emergency DIY Ice bottles
                if (tempDelta >= 10) {
                    actions.push({
                        title: "قوالب الثلج البلاستيكية (حالات الطوارئ)",
                        desc: "في أوقات الارتفاع الحاد والمؤقت، ضع زجاجات بلاستيكية مجمدة ومغلقة بإحكام داخل الفلتر الخلفي أو حوض التعقيم. تجنب إلقاء الثلج المباشر حتى لا تقتل البكتيريا النافعة بصدمة حرارية موضعية."
                    });
                }

                actions.forEach((act, idx) => {
                    const li = document.createElement('li');
                    li.style.marginBottom = '6px';
                    li.innerHTML = `
                        <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">${idx + 1}. ${act.title}</div>
                        <div style="color: #94a3b8; padding-right: 10px; text-align: justify;">${act.desc}</div>
                    `;
                    coolingList.appendChild(li);
                });
            }
        }

        // Tab 3 calculations
        const tapTds = this.state.tapTds;
        const targetTds = this.state.targetTds;
        const roTds = 15;
        
        let mixResult = "";
        if (tapTds <= targetTds) {
            mixResult = "مياه الصنبور ممتازة وملوحتها مطابقة للهدف، لا داعي للخلط بالـ RO.";
        } else if (targetTds <= roTds) {
            mixResult = "تحتاج لمياه تناضح عكسي (RO) صافية 100% مع إضافة مستحضرات التمليح.";
        } else {
            const roPercentage = (tapTds - targetTds) / (tapTds - roTds);
            const roPct = Math.round(roPercentage * 100);
            const tapPct = 100 - roPct;
            mixResult = `خلط: ${roPct}% مياه RO مع ${tapPct}% مياه حنفية معالجة`;
        }

        const oWaterMix = this.container.querySelector('#out-water-mix');
        if (oWaterMix) oWaterMix.innerText = mixResult;

        const tapPh = this.state.tapPh;
        const targetPh = this.state.targetPh;
        let phActionText = "";

        if (tapPh <= targetPh) {
            phActionText = "الـ pH ملائم؛ لا يتطلب تعديلاً للأسفل.";
        } else {
            const phDiff = tapPh - targetPh;
            if (phDiff < 0.4) {
                phActionText = "إضافة أوراق الكاتابا الطبيعية أو أخشاب المانغروف؛ تخفض الـ pH تدريجياً وآمناً.";
            } else if (phDiff < 1.0) {
                phActionText = "تصفية المياه عبر كتل الخث (Peat Moss) المدمجة بالفلترة، مع زيادة معدل خلط الـ RO.";
            } else {
                phActionText = "الخلط المركز بمياه الـ RO هو الطريقة الوحيدة الفعالة والآمنة لكسر عسر الكربونات المرتفع بالمنطقة.";
            }
        }

        const oPhAction = this.container.querySelector('#out-ph-action');
        if (oPhAction) oPhAction.innerText = phActionText;
    }
}

// Global expose
window.initAquariumCalculator = function(containerId) {
    return new AquariumCalculator(containerId);
};
