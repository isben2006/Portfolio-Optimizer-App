from fastapi import FastAPI
from pydantic import BaseModel
import yfinance as yf
import numpy as np
import pandas as pd
import cvxpy as cp
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React default
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class PortfolioRequest(BaseModel):
    tickers: list[str]
    allow_short: str    # 'yes' or 'no'

# Endpoint for optimization
@app.post("/optimize")
def optimize_portfolio(request: PortfolioRequest):
    tickers = request.tickers
    allow_short = request.allow_short.lower() == "yes" # treat yes/no as a boolean
    # Fetch stock price data
    prices = yf.download(tickers, start="2023-01-01", auto_adjust=False)['Adj Close']
    returns = prices.pct_change().dropna()
    mean_returns = returns.mean().values
    cov_matrix = returns.cov().values

    n = len(tickers)
    weights = cp.Variable(n)

    # Fix covariance (ensure PSD) – avoids Cholesky errors
    eigvals, eigvecs = np.linalg.eigh(cov_matrix)
    eigvals[eigvals < 0] = 0
    cov_sqrt = eigvecs @ np.diag(np.sqrt(eigvals))

    # Portfolio risk (DCP compliant)
    portfolio_risk = cp.norm(cov_sqrt.T @ weights)

    # Objective: Maximize Sharpe ratio (scale-invariant trick)
    objective = cp.Maximize(mean_returns @ weights)

    # Portfolio constraints
    constraints = [portfolio_risk <= 1]
    if not allow_short:
        constraints.append(weights >= 0)

    problem = cp.Problem(objective, constraints)
    problem.solve()

    # Normalize weights so they sum to 1 (Sharpe solution must be rescaled)
    opt_weights = weights.value
    opt_weights = opt_weights / opt_weights.sum()

    return {"tickers": tickers, "weights": opt_weights.tolist()}