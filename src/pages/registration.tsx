import { Button, Loader, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import classes from '/src/Styles/Login.module.css';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { MdError } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
//import { useDispatch } from 'react-redux';
//import type { AppDispatch, RootState } from '../store/store';

import { useRegistrationMutation } from '../store/auth';

const Registration = () => {
    //const dispatch = useDispatch<AppDispatch>();
    // const dispatch = useDispatch<AppDispatch>();
    //const { token } = useSelector((state: RootState) => state.root.auth);
    const token = localStorage.getItem('token');
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const navigate = useNavigate();
    const [registration, { isLoading }] = useRegistrationMutation();

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [navigate])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            if (email && password) {
                await registration({ email, password, username });
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
                    PokeApp Registration
                </Title>
                <form onSubmit={handleLogin}>
                    <TextInput
                        label="Username"
                        placeholder="username"
                        size="md"
                        value={username}
                        onChange={(event) => setUsername(event.currentTarget.value)}
                        required
                    />
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
                    <PasswordInput
                        label="Password again"
                        placeholder="password"
                        mt="md"
                        size="md"
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                    />
                    <Button fullWidth mt="xl" size="md" type='submit'>
                        Login
                    </Button>
                </form>
                {isLoading && <Loader size="md" mt="xl" />}
            </Paper>

        </div>
    );
};

export default Registration;