import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'
import React, { ReactElement } from 'react'

interface ActiveLinkProps extends LinkProps {
    activeClassName: string;
    children: ReactElement;
}

export function ActiveLink({children, activeClassName, ...props}: ActiveLinkProps) {
    const { asPath } = useRouter()

    const className = asPath === props.href ? activeClassName : ''

    return(
        <Link {...props}>
            {React.cloneElement(children, {
                className
            })}
        </Link>
    )
}