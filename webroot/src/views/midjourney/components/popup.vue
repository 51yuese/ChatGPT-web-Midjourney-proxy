<template>
    <div class="popBox">
        <div class="popTopBox">
            <div style="display: flex;align-items: center;">
                <img src="../img/imp.png" alt="">
                <p class="popTitle">提示</p>
            </div>
            <img src="../img/close.png" alt="" @click="close">
        </div>
        <div class="introBox">
            <p class="intro">积分不足，请购买会员套餐获取积分，享受更多会员权益</p>
        </div>
        <div class="btnBox">
            <button class="close" @click="close">关闭</button>
            <button class="buy" @click="handleVip">前往购买</button>
        </div>
    </div>

</template>
<script lang="ts" setup>
const emit =defineEmits(['closePop','buyVip'])
const close=()=>{
    emit('closePop')
}
const handleVip=()=>{
    emit('buyVip')
}
</script>
<style lang="less" scoped>
.popBox{
    width: 662px;
    height: 235px;
    background-color: #fff;
    position: absolute;
    z-index: 999;
    top: calc(50% - 235px);
    left: calc(50% - 331px);
    padding: 30px;
    border-radius: 7px;
    display: flex;
    flex-direction: column;
    align-content: space-between;
    justify-content: space-between;
    .popTopBox{
        display: flex;
        justify-content: space-between;
        .popTitle{
            color: #000000;
            font-size: 16px;
            margin-left: 10px;
        }
    }
    .introBox{
       
        .intro{
            color: #000;
            font-size: 14px;
        }
    }
    .btnBox{
        display: flex;
        justify-content: center;
        .close{
            background-color: #DADADA;
            width: 100px;
            height: 40px;
        }
        .buy{
            background-color: #4CA4FF;
            width: 100px;
            height: 40px;
        }
    }
}
</style>