import Link from "next/link";

export default function Footer({ variant = "default", tagline = "Safaris · Beaches · Dubai · Europe · Asia" }) {
  return (
    <footer>
      <div className="wrap">
        <div className="flogo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="Friends International Limited logo" width="67" height="64" />
          <div>
            <b className="flogo">Friends International Limited</b>
            <p>{tagline}</p>
          </div>
        </div>
        <div>
          {variant === "home" ? (
            <>
              <a href="#start">Start here</a> <a href="#destinations">Destinations</a>{" "}
              <Link href="/residents">Residents</Link> <Link href="/summer-camps">Summer Camps</Link>{" "}
              <Link href="/stay">Where to Stay</Link> <a href="#contact">Contact</a>
            </>
          ) : variant === "camps" ? (
            <>
              <Link href="/summer-camps">All summer camps</Link> <Link href="/#contact">Contact</Link>
            </>
          ) : (
            <>
              <Link href="/#packages">All packages</Link> <Link href="/#contact">Contact</Link>
            </>
          )}
        </div>
        <small>© {new Date().getFullYear()} Friends International Limited. All rights reserved.</small>
      </div>
    </footer>
  );
}
