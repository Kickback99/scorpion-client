<template>
  <v-card class="article-skeleton">
    <v-list-item class="pa-0">
      <template v-slot:prepend>
        <div class="skeleton-cover-wrap">
          <v-skeleton-loader
            type="image"
            :width="coverWidth"
            :height="display.xs.value ? undefined : coverHeight"
            class="skeleton-cover"
          />
        </div>
      </template>

      <v-list-item-title class="skeleton-title-row">
        <div class="skeleton-title-area">
          <!-- xs / md+：2 行标题（xs 下 ArticleItem 预留 2 行以保证卡片恒高） -->
          <v-skeleton-loader
            v-if="!display.sm.value"
            type="heading, heading"
            class="skeleton-title"
          />
          <!-- sm：1 行标题 -->
          <v-skeleton-loader
            v-else
            type="heading"
            class="skeleton-title"
          />
        </div>
        <!-- xs：ArticleItem 隐藏分类 chip -->
        <v-skeleton-loader v-if="!display.xs.value" type="chip" class="skeleton-chip" />
      </v-list-item-title>

      <!-- PC: 2-line description -->
      <v-list-item-subtitle v-if="display.mdAndUp.value" class="skeleton-desc">
        <v-skeleton-loader type="sentences" />
      </v-list-item-subtitle>

      <!-- Metadata row -->
      <v-list-item-subtitle class="skeleton-meta pb-1">
        <v-skeleton-loader type="subtitle" />
      </v-list-item-subtitle>
    </v-list-item>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const display = useDisplay()

const coverWidth = computed(() => (display.xs.value ? 110 : display.smAndDown.value ? 150 : 250))
const coverHeight = computed(() => (coverWidth.value * 9) / 16)
</script>

<style scoped lang="scss">
// == Container matching ArticleItem ==
.skeleton-cover-wrap {
  margin: 0 20px 0 12px;
}

.skeleton-cover {
  border-radius: var(--article-cover-radius);
}

// == Aggressive bone margin reset ==
// Vuetify default: all bone types have margin: 16px. This inflates the card
// by ~128px of wasted space. We reset to minimal values.
.article-skeleton {
  :deep(.v-skeleton-loader__image) {
    margin: 0;
    height: 100%; // fill explicit height from props
  }

  :deep(.v-skeleton-loader__heading) {
    margin: 1px 0;
  }

  :deep(.v-skeleton-loader__text) {
    margin: 1px 0;
  }

  :deep(.v-skeleton-loader__chip) {
    margin: 0;
  }
}

// == Title row ==
.skeleton-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.skeleton-title-area {
  flex: 1;
  min-width: 0;
}

// Ensure skeleton loader fills title area
.skeleton-title {
  width: 100%;
}

// Only the second heading bone (PC 2-line title) constrained to 75%
.skeleton-title :deep(.v-skeleton-loader__heading:nth-child(2)) {
  max-width: 75%;
}

// == Description (matches ArticleItem .description { margin-top: 10px }) ==
.skeleton-desc {
  margin-top: 10px;
}

// == Metadata (matches ArticleItem .metadata { padding-top: 4px }) ==
.skeleton-meta {
  padding-top: 4px;
  margin-top: auto;
}

// == Match ArticleItem list-item vertical padding ==
:deep(.v-list-item) {
  padding-bottom: 10px !important;
  padding-top: 10px !important;
}

// == xs（<600px）：对齐 ArticleItem 的恒高适配 ==
// ArticleItem 在 xs 下标题预留 2 行、图片去掉宽高比并拉伸到与文字栏等高
@media (max-width: 599.98px) {
  // 图片占位块跟随文字栏高度拉伸（ArticleItem 同款 align-self: stretch）
  :deep(.v-list-item__prepend) {
    align-self: stretch;
  }

  .skeleton-cover-wrap,
  .skeleton-cover {
    height: 100%;
  }

  // 标题骨按 ArticleItem 的行高排布：16px 骨 + 1.5px 间距 = 17.5px/行，
  // 2 行正好 35px = ArticleItem 的标题区（.title-category h4 的 35px）
  .article-skeleton :deep(.v-skeleton-loader__heading) {
    height: 16px;
    margin: 0 0 1.5px;
  }

  // 日期行占位固定高度，与 ArticleItem 的 .metadata 的 32px 对齐
  .skeleton-meta {
    height: 32px;
  }
}
</style>
