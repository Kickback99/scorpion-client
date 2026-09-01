<template>
    <div class="app-captcha" :class="{ 'is-verified': verified }">
        <!-- ===== 文本验证码（算术/中文/英文/数字/混合/GIF） ===== -->
        <template v-if="isTextType">
            <div class="d-flex align-center mb-1">
                <img
                    v-if="vo.backgroundImage"
                    :src="vo.backgroundImage"
                    class="captcha-text-img"
                    alt="验证码"
                    title="点击刷新"
                    @click="generate"
                >
                <v-btn icon variant="text" size="small" color="primary" :disabled="verified" @click="generate">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </div>
            <v-text-field
                color="primary"
                variant="outlined"
                density="compact"
                v-model="answer"
                label="请输入验证码"
                :rules="answerRules"
                prepend-inner-icon="mdi-shield-check"
                class="mb-2"
                :loading="verifying"
                :disabled="verified"
                @keyup.enter="handleTextVerify"
            ></v-text-field>
        </template>

        <!-- ===== 滑块验证码 ===== -->
        <template v-else>
            <div ref="boxRef" class="captcha-slider-box">
                <img
                    v-if="vo.backgroundImage"
                    :src="vo.backgroundImage"
                    class="captcha-bg"
                    :style="{ height: vo.backgroundImageHeight * scale + 'px' }"
                    alt="滑块背景"
                >
                <img
                    v-if="vo.templateImage"
                    :src="vo.templateImage"
                    class="captcha-piece"
                    draggable="false"
                    :style="{ left: dragX + 'px', width: vo.templateImageWidth * scale + 'px', height: vo.templateImageHeight * scale + 'px' }"
                    alt="滑块"
                    @pointerdown="onPointerDown"
                >
                <v-btn
                    icon
                    variant="text"
                    size="x-small"
                    color="primary"
                    class="captcha-refresh"
                    @click="generate"
                >
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
                <div v-if="!vo.backgroundImage" class="captcha-placeholder text-caption text-grey">加载中…</div>
            </div>
        </template>

        <!-- ===== 验证通过遮罩 ===== -->
        <div v-if="verified" class="captcha-success">
            <v-icon color="success">mdi-check-circle</v-icon>
            <span>验证通过</span>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useEventListener, useElementSize } from '@vueuse/core'
import { captchaGenerateApi, captchaVerifyApi } from '@/api/captcha'

// ============================================================
// 数据
// ============================================================

const props = defineProps({
    // 验证码类型：default-算术/chinese/english/number/mixed/gif/slider/click
    type: {
        type: String,
        default: 'slider'
    }
})

const emit = defineEmits(['success', 'fail'])

// 文本验证码类型集合
const TEXT_TYPES = ['default', 'chinese', 'english', 'number', 'mixed', 'gif']
const isTextType = computed(() => TEXT_TYPES.includes(props.type))

const vo = reactive({
    id: '',
    type: '',
    backgroundImage: '',
    templateImage: '',
    backgroundImageWidth: 0,
    backgroundImageHeight: 0,
    templateImageWidth: 0,
    templateImageHeight: 0
})

const verifying = ref(false)
const verified = ref(false)

// ============================================================
// 滑块：拖拽 + 轨迹采集
// ============================================================

const boxRef = ref(null)
const { width: boxWidth } = useElementSize(boxRef)
// 展示缩放系数：背景图按容器宽度等比缩放，轨迹需换算回自然像素（未测量到宽度时兜底为 1）
const scale = computed(() => (vo.backgroundImageWidth && boxWidth.value ? boxWidth.value / vo.backgroundImageWidth : 1))
// 滑块最大可拖动的相对偏移（渲染像素）
const maxDrag = computed(() => Math.max(0, boxWidth.value - vo.templateImageWidth * scale.value))

// 相对拖动偏移（渲染像素，起点为 0）
const dragX = ref(0)
const isDragging = ref(false)
const trackList = ref([])
const dragStartTime = ref(0)
let startClientX = 0
let lastSampleAt = 0

const onPointerDown = (e) => {
    if (verified.value) return
    isDragging.value = true
    startClientX = e.clientX
    dragStartTime.value = Date.now()
    trackList.value = [{ x: 0, y: 0, t: 0 }]
    lastSampleAt = 0
}

const onPointerMove = (e) => {
    if (!isDragging.value) return
    dragX.value = Math.max(0, Math.min(e.clientX - startClientX, maxDrag.value))
    const t = Date.now() - dragStartTime.value
    if (t - lastSampleAt < 8) return
    lastSampleAt = t
    trackList.value.push({ x: Math.round(dragX.value / scale.value), y: 0, t })
}

const onPointerUp = () => {
    if (!isDragging.value) return
    isDragging.value = false
    const t = Date.now() - dragStartTime.value
    trackList.value.push({ x: Math.round(dragX.value / scale.value), y: 0, t })
    if (trackList.value.length > 1) handleSliderVerify()
}

useEventListener(window, 'pointermove', onPointerMove)
useEventListener(window, 'pointerup', onPointerUp)

// ============================================================
// 生成
// ============================================================

const generate = async () => {
    verified.value = false
    verifying.value = true
    try {
        const res = await captchaGenerateApi(props.type)
        if (res.code === 200 && res.data) {
            Object.assign(vo, res.data)
        }
        dragX.value = 0
        trackList.value = []
    } catch (e) {
        console.error('生成验证码失败:', e)
    } finally {
        verifying.value = false
    }
}

onMounted(() => {
    generate()
})

// ============================================================
// 校验
// ============================================================

// 文本验证码：输入答案后回车校验
const answer = ref('')
const answerRules = [(v) => !!v || '请输入验证码']

const handleTextVerify = async () => {
    if (!answer.value || verified.value) return
    verifying.value = true
    try {
        const res = await captchaVerifyApi({ id: vo.id, type: props.type, answer: answer.value })
        if (res.code === 200 && res.data) {
            verified.value = true
            emit('success', res.data)
        }
    } catch (e) {
        answer.value = ''
        generate()
        emit('fail')
    } finally {
        verifying.value = false
    }
}

const handleSliderVerify = async () => {
    verifying.value = true
    try {
        const track = {
            bgImageWidth: vo.backgroundImageWidth,
            bgImageHeight: vo.backgroundImageHeight,
            templateImageWidth: vo.templateImageWidth,
            templateImageHeight: vo.templateImageHeight,
            startTime: dragStartTime.value,
            stopTime: Date.now(),
            trackList: trackList.value
        }
        const res = await captchaVerifyApi({ id: vo.id, type: props.type, track })
        if (res.code === 200 && res.data) {
            verified.value = true
            emit('success', res.data)
        }
    } catch (e) {
        generate()
        emit('fail')
    } finally {
        verifying.value = false
    }
}
</script>

<style lang="scss" scoped>
.app-captcha {
    position: relative;
    width: 100%;

    .captcha-text-img {
        height: 48px;
        cursor: pointer;
        border: 1px solid var(--v-border-color, #e0e0e0);
        border-radius: 4px;
    }

    .captcha-slider-box {
        position: relative;
        width: 100%;
        min-height: 90px;
        overflow: hidden;
        border-radius: 4px;

        .captcha-bg {
            width: 100%;
            display: block;
        }

        .captcha-piece {
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
            touch-action: none;
            user-select: none;
        }

        .captcha-refresh {
            position: absolute;
            top: 2px;
            right: 2px;
            z-index: 10;
        }

        .captcha-placeholder {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .captcha-success {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.75);
        font-size: 14px;
        color: var(--v-success-base, #4caf50);
        z-index: 20;
        border-radius: 4px;
        pointer-events: none;
    }
}
</style>
