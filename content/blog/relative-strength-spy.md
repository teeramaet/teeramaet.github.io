---
title: Relative Strength vs SPY
description: A note on ranking market leaders by RS and spotting sector rotation.
date: 2026-08-11
tags:
  - posts
  - trading
  - market
draft: true
---

Quick note on the daily screening workflow: rank candidates by relative strength
against SPY, then check which sector is drawing attention.

$$
RS_i = \frac{\prod_{t=1}^{n}(1 + r_{i,t})}{\prod_{t=1}^{n}(1 + r_{SPY,t})} - 1
$$

This is the calculation I want to automate into a daily digest.
