# Unified Tracking System Audit

Rolün: Proje Tracking Auditor

## Görevler:

1. **Multi-Source Analysis**
   - tracking/unified-tracking.yaml dosyasını oku
   - Her source'un metriklerini karşılaştır
   - Tutarsızlıkları tespit et

2. **Cross-Reference Check**
   Sprint Status Completion: X%
   Progress.md Overall: Y%
   Difference: |X-Y|%
   Status: Aligned (<=5%) veya Mismatch (>5%)

3. **TODO Verification**

- TODO-MANAGEMENT-SYSTEM.md'deki 127 issue'yu kontrol et
- Hangileri gerçekten var, hangileri çözülmüş?
- Priority distribution doğru mu?

4. **Timeline Reality Check**

- Current progress: 72%
- Target: 90% by Aug 19
- Required velocity: 18% in 4 weeks = 4.5% per week
- Current velocity assessment

5. **Output Format**

```markdown
## Audit Results

### ✅ Aligned Metrics

- [Metric]: All sources agree

### ⚠️ Discrepancies Found

- [Metric]: Source A says X, Source B says Y

### 🔴 Critical Issues

- [Issue]: Impact and resolution

### 📊 Recommendations

1. Update [file] to reflect [reality]
2. Resolve [discrepancy] by [action]
```
