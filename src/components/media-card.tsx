import Link from "next/link";
import { Icon } from "@/components/icons";

// One card with a picture on top and text underneath.
// Used for projects, supplies, news and equipment, so they all look the same.
//   href      make the whole card a link (leave out for a plain card)
//   image     the photo; if there is none, the `icon` is shown instead
//   badge     small label on the photo, e.g. "Ongoing"
//   kicker    small line above the title, e.g. the location or the date
//   children  anything extra under the text (a price, a link ...)
type Props = {
  href?: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  badge?: { label: string; red?: boolean };
  kicker?: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
};

export function MediaCard({ href, image, imageAlt = "", icon = "building", badge, kicker, title, text, children }: Props) {
  const content = (
    <>
      <div className="media-photo">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={imageAlt} loading="lazy" />
        ) : (
          <Icon name={icon} size={48} />
        )}
        {badge && <span className={badge.red ? "badge badge-red" : "badge"}>{badge.label}</span>}
      </div>
      <div className="media-body">
        {kicker && <span className="media-kicker">{kicker}</span>}
        <h3>{title}</h3>
        {text && <p>{text}</p>}
        {children}
      </div>
    </>
  );

  return href ? <Link href={href} className="media-card">{content}</Link> : <article className="media-card">{content}</article>;
}
