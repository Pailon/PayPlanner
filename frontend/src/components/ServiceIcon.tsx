import { Image } from 'antd';

interface ServiceIconProps {
  icon?: string;
  serviceName: string;
  size?: number;
}

export default function ServiceIcon({
  icon,
  serviceName,
  size = 24,
}: ServiceIconProps) {
  if (icon) {
    try {
      const iconPath = `/icons/subscriptions/${icon}`;
      return (
        <Image
          src={iconPath}
          alt={serviceName}
          width={size}
          height={size}
          preview={false}
          fallback="/icons/subscriptions/default-icon.svg"
        />
      );
    } catch {
      return <DefaultIcon size={size} name={serviceName} />;
    }
  }

  return <DefaultIcon size={size} name={serviceName} />;
}

function DefaultIcon({ size, name }: { size: number; name: string }) {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '4px',
        backgroundColor: '#1890ff',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        fontWeight: 'bold',
      }}
    >
      {initial}
    </div>
  );
}

