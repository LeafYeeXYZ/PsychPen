import { 
  jsArrayToRDataFrame,
  loadRPackage,
  executeRCode,
} from './utils.ts'
const URL = 'http://localhost:8000/execute'
const PASSWORD = '123456'
const PACKAGES = ['psych', 'jsonlite']
const DATA = new Array(10).fill(0).map(() => new Array(50).fill(0).map(() => Math.random()))
// 使用 R 的 psych 库计算探索性因素分析
const CODE = `
# 加载所需的 R 包、数据
${loadRPackage(PACKAGES)}
data <- ${jsArrayToRDataFrame(DATA)}
# 进行探索性因素分析
efa_result <- fa(data, nfactors = 2, rotate = "varimax")
# 提取因子载荷矩阵并显式转换为普通矩阵
loadings <- unclass(efa_result$loadings)  # 去除 S3 类属性
# 将矩阵转换为数据框并添加变量名
loadings_df <- data.frame(Variable = rownames(loadings), loadings)
# 重命名列名（因子名）
colnames(loadings_df)[-1] <- paste0("Factor_", seq_len(ncol(loadings_df) - 1))
# 将因子载荷矩阵转换为 JSON 格式
loadings_json <- toJSON(loadings_df)
loadings_json
`
const data = await executeRCode(CODE, URL, PASSWORD)
try {
  console.log(JSON.parse(JSON.parse(data).result))
} catch {
  console.log(data)
}
