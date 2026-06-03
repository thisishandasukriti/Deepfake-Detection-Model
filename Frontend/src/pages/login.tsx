import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Fade,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    navigate("/detect", { replace: true });
    }
  }, []);


  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Dummy login logic
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setLoading(false);
      navigate("/detect", { replace: true }); // replace with your home/detector route
    }, 1500);
  };

  return (
    <Box
    sx={{
      minHeight: "100vh",
      background: `
        radial-gradient(circle at 20% 30%, rgba(0,200,255,0.15), transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(120,0,255,0.18), transparent 45%),
        linear-gradient(135deg, #0B0F2F, #1A1A2F, #1E005F)
      `,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      p: 2,
      }}
    >

      <Fade in={true}>
        <Paper
          elevation={6}
          sx={{
            p: 5,
            borderRadius: 4,
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 50, color: "#7c3aed", mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "#1e1e2f" }}>
            Welcome Back 👋
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: "#7c3aed",
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#6d28d9" },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <Typography sx={{ mt: 3, color: "#555" }}>
            Don’t have an account?{" "}
            <Link to="/signup" style={{ color: "#7c3aed", textDecoration: "none" }}>
              Sign Up
            </Link>
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
