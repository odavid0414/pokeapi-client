import { Button, Loader, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import classes from '../styles/Login.module.css';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { MdError } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
//import { useDispatch } from 'react-redux';
//import type { AppDispatch, RootState } from '../store/store';

import { useAuthorizeMutation } from '../store/auth';

export const Login = () => {
    //const dispatch = useDispatch<AppDispatch>();
   // const dispatch = useDispatch<AppDispatch>();
    //const { token } = useSelector((state: RootState) => state.root.auth);
    const token = localStorage.getItem('token');
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const [authorize, { isLoading }] = useAuthorizeMutation();

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [navigate])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            if (email && password) {
                await authorize({ email, password });
                navigate('/');
            }
            else {
                notifications.show({
                    title: 'Error',
                    message: 'Please enter valid email and password',
                    color: 'red',
                    position: 'bottom-left',
                    icon: <MdError size={14} />,
                })
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={classes.wrapper}>
            <Paper className={classes.form} radius={0} p={30} miw={"25vw"}>
                <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
                    PokeApp Login
                </Title>
                <form onSubmit={handleLogin}>
                    <TextInput
                        label="Email address"
                        placeholder="hello@gmail.com"
                        size="md"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="password"
                        mt="md"
                        size="md"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                    <Button fullWidth mt="xl" size="md" type='submit'>
                        Login
                    </Button>
                    <Text ta="center" mt="md">
                        Don't have an account?{' '}
                        <Link to="/registration">Sign Up</Link>
                    </Text>
                </form>
                {isLoading && <Loader size="md" mt="xl" />}
            </Paper>

        </div>
    );
};

