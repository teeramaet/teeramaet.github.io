---
title: math test — KaTeX rendering
description: Testing inline and display math.
date: 2026-08-09
tags:
  - posts
  - math
draft: true
---

Inline math: the famous identity $e^{i\pi} + 1 = 0$.

Display math, Euler's formula:

$$
e^{i\theta} = \cos\theta + i\sin\theta
$$

The Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

Relative strength vs. SPY, computed as a ratio of cumulative returns over $n$ days:

$$
RS_i = \frac{\prod_{t=1}^{n}(1 + r_{i,t})}{\prod_{t=1}^{n}(1 + r_{SPY,t})} - 1
$$

If you see clean typeset math above (no raw `$` signs), KaTeX is working.
