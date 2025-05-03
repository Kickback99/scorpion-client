<template>
    <h4>当前断点是 {{ name }}</h4>
    <h4>是否是移动设备 {{ mobile }}</h4>
    <my-button>123</my-button>
    <br>
    <v-btn color="primary">primary</v-btn>
    <v-btn color="error">error</v-btn>
    <v-btn color="secondary">secondary</v-btn>
    <v-btn color="customBlue">自定义颜色按钮</v-btn>
    <v-btn>自定义颜色按钮</v-btn>
    
    <v-btn>按钮</v-btn>       <!-- 圆角变为8px -->
    <v-text-field></v-text-field> <!-- 圆角变为4px -->

    <v-container>
        <v-card>
    <v-card-title>标题</v-card-title> <!-- 字体变大加粗 -->
    <v-card-text v-card-text>内容</v-card-text>   <!-- 内边距调整 -->
    </v-card>
    </v-container>
 


  </template>

<script setup>
import { useDisplay} from 'vuetify'
const { name, mobile, width } = useDisplay()


</script>

<style scoped lang="scss">

</style>