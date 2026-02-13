import { WatermarkEngine } from './core/watermarkEngine.js';
import i18n from './i18n.js';
import { loadImage, checkOriginal, getOriginalStatus, setStatusMessage, showLoading, hideLoading } from './utils.js';
import JSZip from 'jszip';
import mediumZoom from 'medium-zoom';

// global state
let engine = null;
let imageQueue = [];
let processedCount = 0;
let zoom = null;

// dom elements references
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const singlePreview = document.getElementById('singlePreview');
const multiPreview = document.getElementById('multiPreview');
const imageList = document.getElementById('imageList');
const progressText = document.getElementById('progressText');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const originalImage = document.getElementById('originalImage');
const processedSection = document.getElementById('processedSection');
const processedImage = document.getElementById('processedImage');
const originalInfo = document.getElementById('originalInfo');
const processedInfo = document.getElementById('processedInfo');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const serviceModal = document.getElementById('serviceModal');
const serviceContent = document.getElementById('serviceContent');
const serviceCloseBtn = document.getElementById('serviceCloseBtn');
const serviceBackdrop = document.getElementById('serviceBackdrop');
const principleModal = document.getElementById('principleModal');
const principleContent = document.getElementById('principleContent');
const principleCloseBtn = document.getElementById('principleCloseBtn');
const principleBackdrop = document.getElementById('principleBackdrop');

/**
 * initialize the application
 */
async function init() {
    try {
        await i18n.init();
        setupLanguageSwitch();
        showLoading(i18n.t('status.loading'));

        engine = await WatermarkEngine.create();

        hideLoading();
        setupEventListeners();
        setupServiceModal();
        setupPrincipleModal();

        zoom = mediumZoom('[data-zoomable]', {
            margin: 24,
            scrollOffset: 0,
            background: 'rgba(255, 255, 255, .6)',
        })
    } catch (error) {
        hideLoading();
        console.error('initialize error:', error);
    }
}

/**
 * setup language switch
 */
function setupLanguageSwitch() {
    const btn = document.getElementById('langSwitch');
    btn.textContent = i18n.locale === 'zh-CN' ? 'EN' : '中文';
    btn.addEventListener('click', async () => {
        const newLocale = i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN';
        await i18n.switchLocale(newLocale);
        btn.textContent = newLocale === 'zh-CN' ? 'EN' : '中文';
        updateDynamicTexts();
    });
}

/**
 * setup event listeners
 */
function setupEventListeners() {
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(Array.from(e.dataTransfer.files));
    });

    downloadAllBtn.addEventListener('click', downloadAll);
    resetBtn.addEventListener('click', reset);
}

function setupServiceModal() {
    const triggers = document.querySelectorAll('.js-terms-trigger');
    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openServiceModal();
        });
    });

    serviceCloseBtn?.addEventListener('click', closeServiceModal);
    serviceBackdrop?.addEventListener('click', closeServiceModal);

    renderServiceContent();
}

function setupPrincipleModal() {
    const triggers = document.querySelectorAll('.js-principle-trigger');
    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openPrincipleModal();
        });
    });

    principleCloseBtn?.addEventListener('click', closePrincipleModal);
    principleBackdrop?.addEventListener('click', closePrincipleModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && serviceModal && !serviceModal.classList.contains('hidden')) {
            closeServiceModal();
            return;
        }
        if (e.key === 'Escape' && principleModal && !principleModal.classList.contains('hidden')) {
            closePrincipleModal();
        }
    });

    renderPrincipleContent();
}

function openServiceModal() {
    if (!serviceModal) return;
    renderServiceContent();
    serviceModal.classList.remove('hidden');
    updateBodyScrollLock();
}

function closeServiceModal() {
    if (!serviceModal) return;
    serviceModal.classList.add('hidden');
    updateBodyScrollLock();
}

function openPrincipleModal() {
    if (!principleModal) return;
    renderPrincipleContent();
    principleModal.classList.remove('hidden');
    updateBodyScrollLock();
}

function closePrincipleModal() {
    if (!principleModal) return;
    principleModal.classList.add('hidden');
    updateBodyScrollLock();
}

function updateBodyScrollLock() {
    const serviceOpen = serviceModal && !serviceModal.classList.contains('hidden');
    const principleOpen = principleModal && !principleModal.classList.contains('hidden');
    if (serviceOpen || principleOpen) {
        document.body.classList.add('overflow-hidden');
    } else {
        document.body.classList.remove('overflow-hidden');
    }
}

function getServiceContent(locale) {
    if (locale === 'zh-CN') {
        return `
            <article class="space-y-5 text-sm leading-7 text-gray-700 md:text-base">
                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">1. 协议适用范围</h4>
                    <p class="mt-2">欢迎使用本网站提供的图像去水印功能。你访问、浏览或使用本服务，即表示你已阅读并同意本协议全部内容。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">2. 服务性质</h4>
                    <p class="mt-2">本服务为浏览器端工具，处理逻辑在本地执行。我们不承诺服务永久可用、无中断或适用于所有图像场景。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">3. 用户义务</h4>
                    <ul class="mt-2 list-disc space-y-1 pl-5">
                        <li>你应确保上传和处理内容拥有合法授权或使用权。</li>
                        <li>你不得利用本服务从事侵权、欺诈、误导或其他违法行为。</li>
                        <li>你应自行遵守所在地区法律法规及相关平台条款。</li>
                    </ul>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">4. 知识产权与限制</h4>
                    <p class="mt-2">本服务仅处理可见水印，不保证对隐形或隐写类水印（如 SynthID）产生效果。你应对处理后内容的传播和使用承担全部责任。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">5. 免责声明</h4>
                    <p class="mt-2">本服务按“现状”提供，不附带任何明示或默示担保。对因使用本服务导致的直接或间接损失、数据风险、法律纠纷，我们不承担责任。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">6. 协议更新</h4>
                    <p class="mt-2">我们可根据业务或法律要求更新本协议。更新后内容将以页面最新版本为准。继续使用即视为接受更新条款。</p>
                    <p class="mt-2 text-xs text-gray-500">最后更新：2026-02-13</p>
                </section>
            </article>
        `;
    }

    return `
        <article class="space-y-5 text-sm leading-7 text-gray-700 md:text-base">
            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">1. Scope</h4>
                <p class="mt-2">By accessing or using this watermark-removal service, you confirm that you have read and accepted this Service Agreement.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">2. Nature of Service</h4>
                <p class="mt-2">This is a browser-side tool. Processing runs locally on your device. We do not guarantee uninterrupted availability or suitability for every image scenario.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">3. User Responsibilities</h4>
                <ul class="mt-2 list-disc space-y-1 pl-5">
                    <li>You must have lawful rights or authorization for the content you process.</li>
                    <li>You must not use this service for infringement, fraud, deception, or illegal activities.</li>
                    <li>You are responsible for compliance with local laws and relevant platform policies.</li>
                </ul>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">4. IP and Limitations</h4>
                <p class="mt-2">This service targets visible watermarks only. It does not guarantee removal of invisible or steganographic marks (for example SynthID). You remain fully responsible for downstream use of processed content.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">5. Disclaimer</h4>
                <p class="mt-2">The service is provided on an “as is” basis without warranties of any kind. We are not liable for direct or indirect losses, data risks, or legal disputes arising from your use.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">6. Updates</h4>
                <p class="mt-2">We may update this agreement to reflect product or legal changes. The latest on-page version prevails. Continued use means acceptance of the updated terms.</p>
                <p class="mt-2 text-xs text-gray-500">Last updated: 2026-02-13</p>
            </section>
        </article>
    `;
}

function renderServiceContent() {
    if (!serviceContent) return;
    serviceContent.innerHTML = getServiceContent(i18n.locale);
}

function getPrincipleContent(locale) {
    if (locale === 'zh-CN') {
        return `
            <article class="space-y-5 text-sm leading-7 text-gray-700 md:text-base">
                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">问题背景：图很好，但水印常常影响使用</h4>
                    <p class="mt-2">Gemini 生成图像通常会在右下角叠加半透明水印。这个设计用于内容透明度，但在部分真实场景中会干扰排版和展示效果。</p>
                    <ul class="mt-3 list-disc space-y-1 pl-5">
                        <li>演示文稿和提案：水印会破坏版面统一性</li>
                        <li>设计样机和视觉稿：边角标识影响构图</li>
                        <li>个人创意与社媒素材：不利于最终输出观感</li>
                    </ul>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">核心思路：不是“猜测修复”，而是“数学反解”</h4>
                    <p class="mt-2">Gemini 水印属于 Alpha 混合叠加。先理解正向公式，再进行反向求解。</p>
                    <div class="mt-3 space-y-3">
                        <div class="rounded-lg border border-gray-200 bg-gray-100 p-3 font-mono text-xs text-dark md:text-sm">watermarked = α × logo + (1 - α) × original</div>
                        <div class="rounded-lg border border-gray-200 bg-gray-100 p-3 font-mono text-xs text-dark md:text-sm">original = (watermarked - α × 255) / (1 - α)</div>
                    </div>
                    <p class="mt-3">其中 <code>α</code> 是透明度，<code>logo</code> 取白色通道值（255）。本工具的关键是先得到足够准确的 Alpha Map，再对目标区域逐像素逆运算。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">检测规则：按图像尺寸选择水印模板</h4>
                    <div class="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                        <table class="min-w-full text-left text-sm">
                            <thead class="bg-gray-100 text-dark">
                                <tr>
                                    <th class="px-3 py-2">图像条件</th>
                                    <th class="px-3 py-2">水印尺寸</th>
                                    <th class="px-3 py-2">右边距</th>
                                    <th class="px-3 py-2">下边距</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-t border-gray-200">
                                    <td class="px-3 py-2">宽 &gt; 1024 且 高 &gt; 1024</td>
                                    <td class="px-3 py-2">96 × 96</td>
                                    <td class="px-3 py-2">64px</td>
                                    <td class="px-3 py-2">64px</td>
                                </tr>
                                <tr class="border-t border-gray-200">
                                    <td class="px-3 py-2">其他情况</td>
                                    <td class="px-3 py-2">48 × 48</td>
                                    <td class="px-3 py-2">32px</td>
                                    <td class="px-3 py-2">32px</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">为什么比修补类方法更稳定</h4>
                    <p class="mt-2">常见方案如 Inpainting、内容填充属于“预测像素”，容易出现模糊、纹理断裂、文字边缘变形。逆向 Alpha 混合属于“可解释计算”，误差主要来自 8-bit 量化，通常不可感知。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">适用范围与限制</h4>
                    <ul class="mt-2 list-disc space-y-1 pl-5">
                        <li>适用于 Gemini 可见水印（右下角半透明标识）</li>
                        <li>不处理隐形/隐写类水印（如 SynthID）</li>
                        <li>当平台规则变化时，模板与参数可能需要更新</li>
                    </ul>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">来源与致谢</h4>
                    <p class="mt-2">本项目中的逆向 Alpha 混合思路与部分标定方法，参考并致谢 AllenK（Kwyshell）的公开研究与开源实现。</p>
                </section>

                <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <h4 class="text-lg font-bold text-dark">法律与使用声明</h4>
                    <p class="mt-2">该能力仅用于学习与研究。请确保你的使用行为符合所在地法律、平台条款与知识产权要求。你需要对最终用途自行承担责任。</p>
                </section>
            </article>
        `;
    }

    return `
        <article class="space-y-5 text-sm leading-7 text-gray-700 md:text-base">
            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Context: Great Images, But Watermarks Can Be Distracting</h4>
                <p class="mt-2">Gemini images usually include a semi-transparent watermark in the bottom-right corner. That helps transparency, but it can disrupt visual consistency in real production scenarios.</p>
                <ul class="mt-3 list-disc space-y-1 pl-5">
                    <li>Slides and proposals: branding marks break layout consistency</li>
                    <li>Design mockups: corner overlays interfere with composition</li>
                    <li>Creative/social assets: watermark reduces final visual quality</li>
                </ul>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Core Idea: Not Guessing Pixels, But Solving the Equation</h4>
                <p class="mt-2">Gemini watermarking is based on alpha blending. We first model the forward process, then reverse it mathematically.</p>
                <div class="mt-3 space-y-3">
                    <div class="rounded-lg border border-gray-200 bg-gray-100 p-3 font-mono text-xs text-dark md:text-sm">watermarked = α × logo + (1 - α) × original</div>
                    <div class="rounded-lg border border-gray-200 bg-gray-100 p-3 font-mono text-xs text-dark md:text-sm">original = (watermarked - α × 255) / (1 - α)</div>
                </div>
                <p class="mt-3">Here, <code>α</code> is transparency and <code>logo</code> uses white-channel value (255). The key is obtaining a reliable Alpha Map, then applying per-pixel inverse blending in the watermark area.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Detection Rules: Pick Template by Image Size</h4>
                <div class="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                    <table class="min-w-full text-left text-sm">
                        <thead class="bg-gray-100 text-dark">
                            <tr>
                                <th class="px-3 py-2">Image Condition</th>
                                <th class="px-3 py-2">Watermark Size</th>
                                <th class="px-3 py-2">Right Margin</th>
                                <th class="px-3 py-2">Bottom Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-t border-gray-200">
                                <td class="px-3 py-2">W &gt; 1024 and H &gt; 1024</td>
                                <td class="px-3 py-2">96 × 96</td>
                                <td class="px-3 py-2">64px</td>
                                <td class="px-3 py-2">64px</td>
                            </tr>
                            <tr class="border-t border-gray-200">
                                <td class="px-3 py-2">Otherwise</td>
                                <td class="px-3 py-2">48 × 48</td>
                                <td class="px-3 py-2">32px</td>
                                <td class="px-3 py-2">32px</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Why It Is More Reliable Than Inpainting</h4>
                <p class="mt-2">Inpainting or content-aware fill predicts missing pixels and may introduce blur, broken textures, or deformed text edges. Reverse alpha blending is deterministic and explainable. Most residual error is only 8-bit quantization noise.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Scope and Limits</h4>
                <ul class="mt-2 list-disc space-y-1 pl-5">
                    <li>Targets visible Gemini watermark (semi-transparent corner mark)</li>
                    <li>Does not remove invisible/steganographic marks (for example SynthID)</li>
                    <li>If platform watermark behavior changes, templates may need recalibration</li>
                </ul>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">References and Credits</h4>
                <p class="mt-2">This implementation acknowledges the open research and tooling work by AllenK (Kwyshell), especially on reverse alpha blending calibration.</p>
            </section>

            <section class="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h4 class="text-lg font-bold text-dark">Legal Notice</h4>
                <p class="mt-2">This tool is for learning and research purposes. You are responsible for ensuring legal compliance, platform policy compliance, and proper IP usage in your jurisdiction and use case.</p>
            </section>
        </article>
    `;
}

function renderPrincipleContent() {
    if (!principleContent) return;
    principleContent.innerHTML = getPrincipleContent(i18n.locale);
}

function reset() {
    singlePreview.style.display = 'none';
    multiPreview.style.display = 'none';
    imageQueue = [];
    processedCount = 0;
    fileInput.value = '';
}

function handleFileSelect(e) {
    handleFiles(Array.from(e.target.files));
}

function handleFiles(files) {
    const validFiles = files.filter(file => {
        if (!file.type.match('image/(jpeg|png|webp)')) return false;
        if (file.size > 20 * 1024 * 1024) return false;
        return true;
    });

    if (validFiles.length === 0) return;

    imageQueue.forEach(item => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });

    imageQueue = validFiles.map((file, index) => ({
        id: Date.now() + index,
        file,
        name: file.name,
        status: 'pending',
        originalImg: null,
        processedBlob: null,
        originalUrl: null,
        processedUrl: null
    }));

    processedCount = 0;

    if (validFiles.length === 1) {
        singlePreview.style.display = 'block';
        multiPreview.style.display = 'none';
        processSingle(imageQueue[0]);
    } else {
        singlePreview.style.display = 'none';
        multiPreview.style.display = 'block';
        imageList.innerHTML = '';
        updateProgress();
        multiPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        imageQueue.forEach(item => createImageCard(item));
        processQueue();
    }
}

async function processSingle(item) {
    try {
        const img = await loadImage(item.file);
        item.originalImg = img;

        const { is_google, is_original } = await checkOriginal(item.file);
        const status = getOriginalStatus({ is_google, is_original });
        setStatusMessage(status, is_google && is_original ? 'success' : 'warn');

        originalImage.src = img.src;

        const watermarkInfo = engine.getWatermarkInfo(img.width, img.height);
        originalInfo.innerHTML = `
            <p>${i18n.t('info.size')}: ${img.width}×${img.height}</p>
            <p>${i18n.t('info.watermark')}: ${watermarkInfo.size}×${watermarkInfo.size}</p>
            <p>${i18n.t('info.position')}: (${watermarkInfo.position.x},${watermarkInfo.position.y})</p>
        `;

        const result = await engine.removeWatermarkFromImage(img);
        const blob = await new Promise(resolve => result.toBlob(resolve, 'image/png'));
        item.processedBlob = blob;

        item.processedUrl = URL.createObjectURL(blob);
        processedImage.src = item.processedUrl;
        processedSection.style.display = 'block';
        downloadBtn.style.display = 'flex';
        downloadBtn.onclick = () => downloadImage(item);

        processedInfo.innerHTML = `
            <p>${i18n.t('info.size')}: ${img.width}×${img.height}</p>
            <p>${i18n.t('info.status')}: ${i18n.t('info.removed')}</p>
        `;

        zoom.detach();
        zoom.attach('[data-zoomable]');

        processedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error(error);
    }
}

function createImageCard(item) {
    const card = document.createElement('div');
    card.id = `card-${item.id}`;
    card.className = 'bg-white md:h-[140px] rounded-xl shadow-card border border-gray-100 overflow-hidden';
    card.innerHTML = `
        <div class="flex flex-wrap h-full">
            <div class="w-full md:w-auto h-full flex border-b border-gray-100">
                <div class="w-24 md:w-48 flex-shrink-0 bg-gray-50 p-2 flex items-center justify-center">
                    <img id="result-${item.id}" class="max-w-full max-h-24 md:max-h-full rounded" data-zoomable />
                </div>
                <div class="flex-1 p-4 flex flex-col min-w-0">
                    <h4 class="font-semibold text-sm text-gray-900 mb-2 truncate">${item.name}</h4>
                    <div class="text-xs text-gray-500" id="status-${item.id}">${i18n.t('status.pending')}</div>
                </div>
            </div>
            <div class="w-full md:w-auto ml-auto flex-shrink-0 p-2 md:p-4 flex items-center justify-center">
                <button id="download-${item.id}" class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs md:text-sm hidden">${i18n.t('btn.download')}</button>
            </div>
        </div>
    `;
    imageList.appendChild(card);
}

async function processQueue() {
    await Promise.all(imageQueue.map(async item => {
        const img = await loadImage(item.file);
        item.originalImg = img;
        item.originalUrl = img.src;
        document.getElementById(`result-${item.id}`).src = img.src;
        zoom.attach(`#result-${item.id}`);
    }));

    const concurrency = 3;
    for (let i = 0; i < imageQueue.length; i += concurrency) {
        await Promise.all(imageQueue.slice(i, i + concurrency).map(async item => {
            if (item.status !== 'pending') return;

            item.status = 'processing';
            updateStatus(item.id, i18n.t('status.processing'));

            try {
                const result = await engine.removeWatermarkFromImage(item.originalImg);
                const blob = await new Promise(resolve => result.toBlob(resolve, 'image/png'));
                item.processedBlob = blob;

                item.processedUrl = URL.createObjectURL(blob);
                document.getElementById(`result-${item.id}`).src = item.processedUrl;

                item.status = 'completed';
                const watermarkInfo = engine.getWatermarkInfo(item.originalImg.width, item.originalImg.height);

                updateStatus(item.id, `<p>${i18n.t('info.size')}: ${item.originalImg.width}×${item.originalImg.height}</p>
            <p>${i18n.t('info.watermark')}: ${watermarkInfo.size}×${watermarkInfo.size}</p>
            <p>${i18n.t('info.position')}: (${watermarkInfo.position.x},${watermarkInfo.position.y})</p>`, true);

                const downloadBtn = document.getElementById(`download-${item.id}`);
                downloadBtn.classList.remove('hidden');
                downloadBtn.onclick = () => downloadImage(item);

                processedCount++;
                updateProgress();

                checkOriginal(item.originalImg).then(({ is_google, is_original }) => {
                    if (!is_google || !is_original) {
                        const status = getOriginalStatus({ is_google, is_original });
                        const statusEl = document.getElementById(`status-${item.id}`);
                        if (statusEl) statusEl.innerHTML += `<p class="inline-block mt-1 text-xs md:text-sm text-warn">${status}</p>`;
                    }
                }).catch(() => {});
            } catch (error) {
                item.status = 'error';
                updateStatus(item.id, i18n.t('status.failed'));
                console.error(error);
            }
        }));
    }

    if (processedCount > 0) {
        downloadAllBtn.style.display = 'flex';
    }
}

function updateStatus(id, text, isHtml = false) {
    const el = document.getElementById(`status-${id}`);
    if (el) el.innerHTML = isHtml ? text : text.replace(/\n/g, '<br>');
}

function updateProgress() {
    progressText.textContent = `${i18n.t('progress.text')}: ${processedCount}/${imageQueue.length}`;
}

function updateDynamicTexts() {
    if (progressText.textContent) {
        updateProgress();
    }
    renderServiceContent();
    renderPrincipleContent();
}

function downloadImage(item) {
    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = `unwatermarked_${item.name.replace(/\.[^.]+$/, '')}.png`;
    a.click();
}

async function downloadAll() {
    const completed = imageQueue.filter(item => item.status === 'completed');
    if (completed.length === 0) return;

    const zip = new JSZip();
    completed.forEach(item => {
        const filename = `unwatermarked_${item.name.replace(/\.[^.]+$/, '')}.png`;
        zip.file(filename, item.processedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `unwatermarked_${Date.now()}.zip`;
    a.click();
}

init();
