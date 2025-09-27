import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/images/logo.png" />
    );
}
