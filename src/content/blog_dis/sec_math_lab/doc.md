## lab1

### 参考

[一位疑似学长的博客](https://hujiekang.top/posts/bignum-calc/)

### 原理

模拟人们手工进行 “竖式计算” 的过程编写其加减乘除函数。

1. 加法

![image-20251115093010707](C:\Users\zzz10\AppData\Roaming\Typora\typora-user-images\image-20251115093010707.png)

2.减法

![image-20251115093039607](C:\Users\zzz10\AppData\Roaming\Typora\typora-user-images\image-20251115093039607.png)

3.乘法

![image-20251115093107560](C:\Users\zzz10\AppData\Roaming\Typora\typora-user-images\image-20251115093107560.png)

4.除法

![image-20251115093209573](C:\Users\zzz10\AppData\Roaming\Typora\typora-user-images\image-20251115093209573.png)

### 代码

因为没有要求用高级语言所以选择用python

#### 加法

```
    def bigSum(n1, n2):
    	# 特殊情况（一个数字为0 & 两数字位数不同）
        if len(n1) < len(n2):
            n1, n2 = n2, n1
        if n1 == []:
            return n2
        if n2 == []:
            return n1
        
        #反转列表，让低位在前
        num1 = list(reversed(n1))
        num2 = list(reversed(n2))
        result = []
        c = 0
        
        #用attend将结果加入列表末位，进位存入c进入下一循环
        for i in range(0, len(num2)):
            if num1[i] + num2[i] + c < 10 :
                result.append(num1[i] + num2[i] + c)
                c = 0
            else:
                result.append(num1[i] + num2[i] + c - 10)
                c = 1
        ```  
        如果两数字位数相同，则结果首位取决于c
        若不相同，则将num1数组剩下的位数
        ```
        if len(num1) == len(num2):
            result.append(c)
        else:
            result.append(c+num1[len(num2)])
            for each in num1[len(num2)+1:]:
                result.append(each)

        #反转结果列表 去掉可能的前导零
        result.reverse()
        if result[0] == 0:
            result.pop(0)
        return result
```



#### 减法

```
def bigDel(n1, n2):
        # 处理特殊情况
		if len(n1) < len(n2):
            n1, n2 = n2, n1
        if n1 == n2 or (n1 == [] and n2 == []):
            return 0
        if n1 == []:
            return -n2
        if n2 == []:
            return n1

        # 反转列表，让低位在前
        num1 = list(reversed(n1))
        num2 = list(reversed(n2))
        result = []
        c = 0 
        
        # 同加法
        for i in range(0, len(num2)):
            if (num1[i] - num2[i] + c >= 0):
                result.append(num1[i] - num2[i] + c)
                c = 0
            else:
                # 当前位不够减，需要向前借位
                result.append(num1[i] - num2[i] + c + 10)
                c = -1  # 标记借位
                
        # 处理被减数的剩余位数
        if len(num1) > len(num2):
            result.append(c + num1[len(num2)])
            for each in num1[len(num2) + 1:]:
                result.append(each)
                
        # 反转回高位在前
        result.reverse()
        
    	#反转结果列表 去掉可能的前导零
        if result[0] == 0:
            result.pop(0)

        return result
```

#### 乘法

```
    def bigMult(num1, num2):
    
        # 反转列表，低位在前
        num1.reverse()
        num2.reverse()
        result = []
        uv = 0 
        
        # 初始化结果数组，长度为两个数字位数之和+1（最大可能位数）
        for i in range(0, len(num1) + len(num2) + 1):
            result.append(0)
            
        # 乘法核心算法：逐位相乘
        for i in range(0, len(num1)):
            c = 0  
            for j in range(0, len(num2)):
                # uv = 当前位置的已有值 + 当前位乘积 + 进位
                uv = result[i + j] + int(num1[i]) * int(num2[j]) + c
                result[i + j] = uv % 10  # 取个位数
                c = uv // 10             # 取进位
            result[i + len(num2)] = uv // 10  # 处理最后的进位
            
        # 同
        result.reverse()
        if result[0] == 0:
            result.pop(0)
            
        return result

```

#### 除法

```
def bigDiv(num1, num2):

        # 处理特殊情况
        if num1 == num2:
            return [1,], [0,]  # 相等的情况：商=1，余数=0
        elif not BigNum.__isBigger(num1, num2):
            num1, num2 = num2, num1
        if num2[0] == 0 and len(num2) == 1:
            return [-1,], [0,]  # 除数为0的错误情况

        # 初始化商数组
        result = []
        for i in range(0, len(num1) - len(num2) + 1):
            result.append(0)

        # 对齐除数：在除数后面补零，使其位数与被除数相同
        num2_duiqi = num2[:]  # 复制除数
        mult_times = 0        # 记录补零的次数
        times = 0             # 记录当前位的商

        # 补零对齐
        while len(num2_duiqi) != len(num1):
            num2_duiqi.append(0)
            mult_times += 1

        # 长除法核心算法
        while True:
            # 当被除数大于等于对齐后的除数时，不断相减
            while BigNum.__isBigger(num1, num2_duiqi):
                num1 = BigNum.bigSub(num1, num2_duiqi)
                # 移除相减后可能产生的前导零
                while num1[0] == 0:
                    num1.pop(0)
                times += 1  # 记录相减次数，即当前位的商
                
            # 将当前位的商存入结果
            result[mult_times] = times
            times = 0  # 重置计数器

            # 移除除数末尾的零，准备处理下一位
            if num2_duiqi[len(num2_duiqi) - 1] == 0 and len(num2_duiqi) > len(num2):
                num2_duiqi.pop(len(num2_duiqi) - 1)
                mult_times -= 1
            else:
                # 除法完成，反转商数组（因为我们是高位先计算的）
                result.reverse()
                break

        return result, num1  # 返回商和余数
```

